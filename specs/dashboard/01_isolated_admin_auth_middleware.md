# 01_isolated_admin_auth_middleware.md

## 1. Project Reference & Context
* **Project Name:** Galaxy Elite Private Match — Corporate Admin Control Platform[cite: 33, 37]
* **Module:** Isolated Administrative Route Guarding, Session Token Validation, and Customs Claims Security Enforcement[cite: 28, 42]
* **Frontend Architecture:** Standalone Next.js App Router (Isolated repository mapping absolute control screens)[cite: 32, 33]
* **Target Backend Connection:** Node.js + Express REST API verified with Firebase Admin SDK tokens[cite: 28]

---

## 2. Standalone Administrative Access Architecture
Because this application is decoupled from the main customer website, its authorization mechanism must follow a strict zero-trust model to protect sensitive company files[cite: 29]:

1. **Complete Perimeter Gate:** Every root layout path (`/*`) within this standalone repository is protected by default[cite: 28]. There are no public landing views or public marketing spaces in this application build[cite: 28].
2. **Server-Side Token Interception:** The app must deploy a central Next.js Middleware controller or layout wrapper that inspects the incoming authentication context before rendering any administrative interface components[cite: 28, 42].
3. **Redirection Safeguard:** If an unauthenticated session, or a standard registered customer session (`primary_role == "user" | "buyer" | "owner"`), attempts to load this platform, they must be blocked and redirected instantly to a dedicated corporate login panel (`/login`)[cite: 28, 42].

---

## 3. Firebase Custom Claims Verification Protocol
To prevent client-side role manipulation, the application must read access permissions exclusively from verified Firebase Custom Claims[cite: 28, 42]:

* **Token Extraction Handshake:**
  * When a user inputs credentials into the corporate login view, the frontend passes the Firebase ID Token to your Node.js + Express backend via authorization headers[cite: 28].
  * The server processes custom account attributes and passes back a decoded payload containing verified custom tokens[cite: 28].
* **Claim-Based Authorization Matrix:**
  * `superAdmin: true` $\rightarrow$ Unrestricted access. Instantly unblocks the master taxonomy panel and audit logs view[cite: 42].
  * `admin: true` $\rightarrow$ Fully unblocks submission queues, match workflows, and communication review setups[cite: 42].
  * `compliance: true` $\rightarrow$ Restricts primary write parameters, but opens up document validation queues, file reviews, and checklist controls[cite: 42].

---

## 4. Required Core Layout Routes

This standalone admin application must securely handle, protect, and map the following structural user interfaces[cite: 27, 28]:

### 4.1 Corporate Sign-In Panel (`/login`)
* **Access:** Publicly accessible entryway for staff credentials entry[cite: 28].
* **Behavior:** Captures email/password configurations, handles Firebase Client SDK auth initialization, and intercepts errors if a standard non-privileged customer account attempts to sign in.

### 4.2 Corporate Overview Dashboard (`/`)
* **Access:** Blocked unless session holds verified `admin`, `compliance`, or `superAdmin` claims[cite: 28, 42].
* **Behavior:** Displays status metric cards: new pending submissions, compliance holds, documents requested, and active match requests pending team assignment[cite: 27].

### 4.3 All Administrative Protected Paths (`/*`)
* **Sub-Routes to Enforce:**
  * `/submissions` & `/submissions/[id]` — Moderation control detail view[cite: 27].
  * `/documents` & `/documents/[id]` — Document check and verification panel[cite: 27].
  * `/matches` & `/matches/[id]` — Match scoring engine manager and deal flow stage controller[cite: 27].
  * `/taxonomy` — Recursive dropdown tree editor panel (Restricted to `superAdmin` only)[cite: 27, 42].
  * `/audit-log` — Master administrative logging timeline (Restricted to `superAdmin` only)[cite: 27, 42].

---

## 5. Security & Crawler Isolation Rules
1. **Absolute Search Engine Exclusion:** The master layout code (`app/layout.tsx`) must inject `<meta name="robots" content="noindex, nofollow, noarchive" />` header metadata[cite: 36]. This ensures that no page in this corporate application is ever crawled or indexed by external search engines[cite: 36].
2. **Strict CORS Whitelisting:** All data-fetch requests initiated via this standalone application to your Express backend must include origin values matching your specific corporate admin subdomain setup (e.g., `control.galaxyelite.ae`). Wildcard operations are completely banned.