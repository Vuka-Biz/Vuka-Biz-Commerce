# Vuka Biz Commerce

Wholesale marketplace for township spaza shops and the drivers who deliver to them. Owners pool orders for farm-gate prices, pay into escrow, and release payment with a handover PIN only after inspecting stock. Every verified trade builds the shop's formal books and Vuka Score for micro-credit.

Built with Expo (SDK 58), Expo Router, and React Native. Runs on Android, iOS, and web from one codebase.

**Live web app:** https://vuka-biz.expo.app

## Demo Credentials

| Role | Cellphone | PIN | Capabilities |
| --- | --- | --- | --- |
| Spaza Owner | `071 234 5678` | `1234` | Search stock, pool bulk orders, checkout, view handover PIN |
| Delivery Driver | `082 345 6789` | `1234` | View dispatches, verify PIN, complete handover |
| Support Staff | `060 123 4567` | `1234` | Live console of all orders, audit trails, unlock PIN-locked orders |

The login screen also features a **Use demo account** shortcut. Accounts live in Firebase Auth; the role (owner, driver or support) is a server-set custom claim.

## Demo Walkthrough (2 Minutes)

Works best with two devices or browser windows (one signed in as Owner, one as Driver):

1. **Owner – Shop:** Search or filter stock, and adjust quantities in the crate.
2. **Owner – Checkout:** Choose delivery and payment options, then select **Place Order**. The API prices the order on the server, stores it in Firestore, and issues a handover PIN.
3. **Owner – Orders:** Track the order live. Select **Tap to reveal PIN**.
4. **Driver – Driver Tab:** The order appears on the manifest within 5 seconds. Enter the owner's PIN. The API verifies it; 5 incorrect attempts lock the order.
5. **Owner:** Within 5 seconds, the order status updates to **Delivered**, escrow status changes to **Released**, and **Books** logs the purchase while updating the Vuka Score.
6. **Support – Console:** Sign in as support (desktop works best) to see every order live, read each order's audit trail, and unlock orders locked by wrong PINs. Unlocking issues a new PIN; staff never see PINs.

## System Architecture

```
Expo App / Web App (vuka_biz_webapp)
│  Firebase Auth (REST) -> ID Token
│  HTTPS + Authorization: Bearer <ID Token>
▼
EAS Hosting - Cloudflare Edge: Global load balancing, autoscaling, TLS
▼
src/app/+middleware.ts   per-IP rate limit · method allowlist · body-size cap · bearer required
▼
src/app/api/*+api.ts     token signature check · per-user rate limit · input validation
▼
src/server/OrderService  server-side pricing · PIN issue/verify · role checks · audit trail
▼
Cloud Firestore (nam5, US multi-region) via service account - clients have no direct access
```

## Software Security & SSDL Reference

| Threat / Domain | Control Safeguard | Where Implemented |
| --- | --- | --- |
| Unauthenticated Access | Firebase ID token required as `Bearer`; RS256 signature verified against Google's keys, plus `aud`, `iss`, `exp`, `iat`, `auth_time`, and `sub` checks. Fails closed if unconfigured. | `src/server/FirebaseAuth.ts` |
| Privilege Escalation | Role comes from a server-set custom claim (users cannot alter it). Only owners place orders; only drivers confirm handovers; only support can list all orders or unlock. | `OrderService` |
| Floods / Abuse | Token-bucket rate limits: 120 burst, 2/s per IP; 20 burst, 1 per 2s per user for writes. Returns HTTP 429 with `Retry-After` header. | `+middleware.ts`, `RateLimiter.ts` |
| PIN Brute Force | 4-digit PIN generated via `crypto.getRandomValues`, constant-time compare, order locks after 5 wrong attempts, optimistic concurrency stops parallel guessing. Support unlock issues a fresh PIN. | `OrderService`, `FirestoreOrderRepository` |
| Price Tampering | Client sends only product IDs and quantities; prices, discounts, fees, and totals are computed strictly on the server. | `OrderService.place` |
| Oversized / Malformed Input | 16 KB body cap (header and streamed bytes), JSON content type enforcement, strict schema validation, unknown fields ignored. | `http.ts`, `OrderService.parsePlaceOrder` |
| Data Exposure | Handover PIN is returned only to the order's owner (never to drivers or support). Errors return generic responses with no stack traces. Firestore rules deny all direct client access. | `OrderService`, `http.ts`, `firestore.rules` |
| Browser Attacks | `Content-Security-Policy` (incl. `frame-ancestors 'none'`), HSTS, `nosniff`, `no-referrer`, `no-store` headers on every API response. | `http.ts` |
| Secret Leakage | Service account credentials only in server environment variables (EAS secret in production, never in the client bundle); key files and `.env*.local` are gitignored. | `config.ts`, `.gitignore` |
| Accountability | Every order keeps an audit trail: placed, wrong PIN, locked, unlocked, delivered, with actor and time. | `OrderService`, support console |

**Known limits (MVP):** rate-limit counters live in each edge instance's memory, so they are per instance, not global. The 4-digit login PIN maps to a Firebase password and relies on Firebase's sign-in throttling. Firestore is hosted in the US (`nam5`), which is a POPIA cross-border consideration. Pickup and en-route tracking steps are simulated until live driver GPS is connected.

## Repository Structure

```
Vuka-Biz-Commerce/
└── vuka_biz_webapp/              Expo app, web app and API
    ├── src/
    │   ├── app/                  screens (Expo Router) + api/ routes + +middleware.ts
    │   ├── server/               server-only code: auth, rate limiter, HTTP hardening, order service, Firestore repository
    │   ├── services/             client stores (AuthStore, CartStore, OrderStore, AdminStore), ApiClient, FirebaseIdentity
    │   ├── components/           ui/ design system · vuka/ feature components
    │   ├── models/               immutable domain classes shared by app and server
    │   └── data/                 catalogue and demo profile data
    ├── scripts/firebase-setup.mjs   one-off Firebase setup script (rules, sign-in, demo users)
    └── firestore.rules              deny all direct client access
```

## Installation & Local Run

```bash
# 1. Clone repository
git clone https://github.com/Vuka-Biz/Vuka-Biz-Commerce.git
cd Vuka-Biz-Commerce/vuka_biz_webapp

# 2. Install dependencies
npm install

# 3. Environment setup
# Create .env.local with the public Expo Firebase config (EXPO_PUBLIC_FIREBASE_*)
# and the server keys (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)

# 4. First-time Firebase setup (rules, sign-in, demo users)
node --env-file=.env.local scripts/firebase-setup.mjs
#    add --reset-orders to clear all orders before a demo

# 5. Run development server
npx expo start          # Press w for Web, a for Android, i for iOS
```
