Vuka Biz Commerce
Wholesale marketplace for township spaza shops and the drivers who deliver to them. Owners pool orders for farm-gate prices, pay into escrow, and release payment with a handover PIN only after inspecting stock. Every verified trade builds the shop's formal books and Vuka Score for micro-credit.
Built with Expo (SDK 58), Expo Router, and React Native. Runs on Android, iOS, and web from one codebase.
Demo Credentials

Role
Cellphone
PIN
Capabilities
Spaza Owner
071 234 5678
1234
Search stock, pool bulk orders, checkout, view handover PIN
Delivery Driver
082 345 6789
1234
View dispatches, verify PIN, complete handover

The login screen also features a Use demo account shortcut. Accounts live in Firebase Auth; the role (owner or driver) is a server-set custom claim.
Demo Walkthrough (2 Minutes)
Works best with two devices or browser windows (one signed in as Owner, one as Driver):
1. Owner - Shop: Search or filter stock, and adjust quantities in the crate.
2. Owner - Checkout: Choose delivery and payment options, then select Place Order. The API prices the order on the server, stores it in Firestore, and issues a handover PIN.
3. Owner - Orders: Track the order live. Select Tap to reveal PIN.
4. Driver - Driver Tab: The order appears on the manifest within 5 seconds. Enter the owner's PIN. The API verifies it; 5 incorrect attempts lock the order.
5. Owner: Within 5 seconds, the order status updates to Delivered, escrow status changes to Released, and Books logs the purchase while updating the Vuka Score.
   System Architecture

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
src/server/OrderService  server-side pricing · PIN issue/verify · role checks · Twilio / WhatsApp API
▼
Cloud Firestore (africa-south1) via service account - clients have no direct access
Software Security & SSDL Reference

Threat / Domain
Control Safeguard
Where Implemented
Unauthenticated Access
Firebase ID token required as Bearer; RS256 signature verified against Google's keys, plus aud, iss, exp, iat, auth_time, and sub checks. Fails closed if unconfigured.
src/server/FirebaseAuth.ts
Privilege Escalation
Role comes from a server-set custom claim (users cannot alter it). Only owners place orders; only drivers confirm handovers.
OrderService, Firestore RBAC Rules
Floods / Abuse
Token-bucket rate limits: 120 burst, 2/s per IP; 20 burst, 1 per 2s per user for writes. Returns HTTP 429 with Retry-After header.
+middleware.ts, RateLimiter.ts
PIN Brute Force
4-digit PIN generated via crypto.getRandomValues, constant-time compare, order locks after 5 wrong attempts, optimistic concurrency stops parallel guessing.
OrderService, FirestoreOrderRepository
Price Tampering
Client sends only product IDs and quantities; prices, discounts, fees, and totals are computed strictly on the server.
OrderService.place
Oversized / Malformed Input
16 KB body cap (header and streamed bytes), JSON content type enforcement, strict schema validation, unknown fields ignored.
http.ts, OrderService.parsePlaceOrder
Data Exposure
Handover PIN is returned only to the order's owner. Errors return generic responses with no stack traces. Firestore rules deny all direct client access.
OrderService, http.ts, firestore.rules
Browser Attacks
Content-Security-Policy, HSTS, X-Frame-Options: DENY, nosniff, no-referrer, no-store headers on every API response.
http.ts
Secret Leakage
Service account key exclusively in server environment variables (vuka-biz-commerce-firebase-adminsdk-fbsvc-b8cb3f708a.json); key files and .env*.local are gitignored.
config.ts, .gitignore

Repository Structure

src/
app/          screens (Expo Router) + api/ routes + +middleware.ts
server/       server-only code: auth, rate limiter, HTTP hardening, order service, Firestore repository
services/     client stores (AuthStore, CartStore, OrderStore), ApiClient, FirebaseIdentity
models/       immutable domain classes shared by app and server
data/         catalogue and demo profile data
vuka_biz_webapp/ integrated web application module
scripts/firebase-setup.mjs   one-off Firebase setup script (rules, sign-in, demo users)
firestore.rules              deny all direct client access
Installation & Local Run

# 1. Clone repository
git clone https://github.com/Vuka-Biz/Vuka-Biz-Commerce.git
cd Vuka-Biz-Commerce

# 2. Install dependencies
npm install

# 3. Environment setup
# Ensure .env.local contains public Expo Firebase config and server admin keys

# 4. First-time Firebase setup
node scripts/firebase-setup.mjs <service-account.json>

# 5. Run development server
npx expo start          # Press w for Web, a for Android, i for iOS
