import { ApiError } from './http';
import type { OrderRecord, OrderRepository } from './OrderService';

export type ServiceAccount = { projectId: string; clientEmail: string; privateKey: string };

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

type FirestoreDocument = { name: string; fields?: Record<string, FirestoreValue>; updateTime: string };

function encode(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: encodeFields(value as Record<string, unknown>) } };
}

function encodeFields(object: Record<string, unknown>): Record<string, FirestoreValue> {
  return Object.fromEntries(Object.entries(object).filter(([, v]) => v !== undefined).map(([k, v]) => [k, encode(v)]));
}

function decode(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('stringValue' in value) return value.stringValue;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decode);
  return decodeFields(value.mapValue.fields ?? {});
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));
}

function base64Url(bytes: ArrayBuffer | Uint8Array): string {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Orders in Cloud Firestore over its REST API, authenticated as the Admin
 * service account with WebCrypto – no Admin SDK, so it runs on the edge runtime.
 * Clients have no direct access (see firestore.rules); only this server does.
 */
export class FirestoreOrderRepository implements OrderRepository {
  private static readonly COLLECTION = 'orders';

  private accessToken?: { value: string; expiresAt: number };
  /** Firestore updateTime per record we handed out, for optimistic concurrency on update. */
  private readonly versions = new WeakMap<OrderRecord, string>();

  constructor(private readonly account: ServiceAccount) {}

  private get documentsUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.account.projectId}/databases/(default)/documents`;
  }

  async create(order: OrderRecord): Promise<void> {
    const url = `${this.documentsUrl}/${FirestoreOrderRepository.COLLECTION}?documentId=${encodeURIComponent(order.id)}`;
    await this.request('POST', url, { fields: encodeFields(order) });
  }

  async get(id: string): Promise<OrderRecord | undefined> {
    const doc = await this.request<FirestoreDocument>('GET', this.docUrl(id), undefined, [404]);
    return doc && this.toRecord(doc);
  }

  async listByOwner(ownerUid: string): Promise<OrderRecord[]> {
    const orders = await this.query('ownerUid', ownerUid);
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listOpen(): Promise<OrderRecord[]> {
    return this.query('status', 'placed');
  }

  /** Fails with 409 if the order changed since it was read (e.g. two PIN attempts at once). */
  async update(order: OrderRecord): Promise<void> {
    const version = this.versions.get(order);
    const precondition = version ? `?currentDocument.updateTime=${encodeURIComponent(version)}` : '';
    await this.request('PATCH', `${this.docUrl(order.id)}${precondition}`, { fields: encodeFields(order) });
  }

  private docUrl(id: string): string {
    return `${this.documentsUrl}/${FirestoreOrderRepository.COLLECTION}/${encodeURIComponent(id)}`;
  }

  private async query(field: string, value: string): Promise<OrderRecord[]> {
    const rows = await this.request<{ document?: FirestoreDocument }[]>('POST', `${this.documentsUrl}:runQuery`, {
      structuredQuery: {
        from: [{ collectionId: FirestoreOrderRepository.COLLECTION }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } },
        limit: 100,
      },
    });
    return (rows ?? []).flatMap((row) => (row.document ? [this.toRecord(row.document)] : []));
  }

  private toRecord(doc: FirestoreDocument): OrderRecord {
    const record = decodeFields(doc.fields ?? {}) as OrderRecord;
    this.versions.set(record, doc.updateTime);
    return record;
  }

  private async request<T>(method: string, url: string, body?: unknown, allowStatus: number[] = []): Promise<T | undefined> {
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${await this.token()}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (allowStatus.includes(response.status)) return undefined;
    if (response.status === 409 || response.status === 412) {
      throw new ApiError(409, 'This order was just updated. Refresh and try again.');
    }
    if (!response.ok) {
      console.error('Firestore error', response.status, await response.text());
      throw new ApiError(503, 'Order storage is unavailable. Try again shortly.');
    }
    return (await response.json()) as T;
  }

  /** OAuth access token from a self-signed service account JWT, cached until near expiry. */
  private async token(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.accessToken.expiresAt - 60 > now) return this.accessToken.value;

    const header = base64Url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
    const claims = base64Url(
      new TextEncoder().encode(
        JSON.stringify({
          iss: this.account.clientEmail,
          scope: 'https://www.googleapis.com/auth/datastore',
          aud: 'https://oauth2.googleapis.com/token',
          iat: now,
          exp: now + 3600,
        }),
      ),
    );
    const pem = this.account.privateKey.replace(/\\n/g, '\n').replace(/-----[^-]+-----|\s/g, '');
    const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`));

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${header}.${claims}.${base64Url(signature)}`,
      }),
    });
    if (!response.ok) {
      console.error('Service account token error', response.status, await response.text());
      throw new ApiError(503, 'Order storage is unavailable. Try again shortly.');
    }
    const { access_token, expires_in } = (await response.json()) as { access_token: string; expires_in: number };
    this.accessToken = { value: access_token, expiresAt: now + expires_in };
    return access_token;
  }
}
