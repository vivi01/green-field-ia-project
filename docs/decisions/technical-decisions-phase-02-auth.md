# Technical Decisions — Phase 02: Auth & Account Management

> **Phase:** Cadastro, Login e Gerenciamento de Conta
> **Status:** Pending
> **Date:** 2026-05-05

---

## TD-01: Authentication Strategy

**Context:** The project requires secure access for web (Next.js) and potentially native clients. We need to balance performance (statelessness) with security (revocability).

**Options:**

### Option A: Traditional Session-Based (Stateful)
- Standard session cookie managed by the server and stored in Redis/DB.
- **Pros:** Instant revocation of any session; naturally protected against XSS via HttpOnly cookies.
- **Cons:** Harder to scale horizontally without a shared store; less friendly for native mobile apps.

### Option B: Pure JWT (Stateless)
- Self-contained token containing user data and expiration.
- **Pros:** Maximum scalability; no database hits for most requests; native-app friendly.
- **Cons:** Cannot be revoked before expiration (huge security risk); usually stored in localStorage (XSS risk).

### Option C: Hybrid JWT + Refresh Token (Recommended)
- Short-lived Access Token (JWT) for APIs + Long-lived Refresh Token stored in the DB/Redis for session management.
- **Pros:** Best of both worlds—performance of JWTs with the ability to revoke sessions via Refresh Token invalidation.
- **Cons:** Slightly more complex to implement (requires token rotation and extra database table/store).

**Recommendation:** **Option C** — It provides the security of instant revocation while maintaining the performance and scalability benefits of JWTs, which is the industry standard for NestJS 11 in 2026.

**Decision:** _[to be filled by user]_

---

## TD-02: Password Hashing Algorithm

**Context:** We must ensure user passwords are never stored in plaintext and are resistant to rainbow table and brute-force attacks.

**Options:**

### Option A: Bcrypt (Recommended)
- Industry standard for years; automatically handles salting; computationally expensive by design.
- **Pros:** High compatibility; battle-tested; extremely secure when used with sufficient cost factor.
- **Cons:** Slower than newer alternatives like Argon2 on some hardware.

### Option B: Argon2
- Winner of the Password Hashing Competition (PHC); resistant to GPU-based attacks.
- **Pros:** More secure against modern hardware attacks; highly configurable (memory, time, parallelism).
- **Cons:** Requires a native binding in Node.js which can sometimes complicate Docker builds.

**Recommendation:** **Option A** — `bcrypt` (or `bcryptjs`) is more than sufficient for this project's requirements and offers the best balance of security and ease of integration in the NestJS ecosystem.

**Decision:** _[to be filled by user]_

---

## TD-03: Token Storage & Delivery

**Context:** How the Access and Refresh tokens are delivered to and stored by the frontend (Next.js).

**Options:**

### Option A: LocalStorage / SessionStorage
- Tokens sent in JSON response and stored in the browser's storage.
- **Pros:** Very easy to implement; works with standard `Authorization: Bearer` headers.
- **Cons:** Vulnerable to XSS attacks (malicious scripts can steal the tokens).

### Option B: HttpOnly, Secure, SameSite Cookies (Recommended)
- Tokens are sent via `Set-Cookie` headers and handled automatically by the browser.
- **Pros:** Immune to XSS token theft; `SameSite=Strict` mitigates CSRF.
- **Cons:** Slightly more complex to handle on the backend (handling cookies vs. headers).

**Recommendation:** **Option B** — Storing tokens in `HttpOnly` cookies is the gold standard for security in 2026, preventing the most common web-based token theft vectors.

**Decision:** _[to be filled by user]_

---

## TD-04: Account Confirmation & Recovery Pattern

**Context:** Handling email-based flows for account activation and password resets.

**Options:**

### Option A: Short-lived Signed JWTs (Recommended)
- Generate a JWT with a small payload (e.g., `{ userId, type: 'reset' }`) and a very short expiration (15-60m).
- **Pros:** Stateless; no need to store the token in the database; easy to verify signature.
- **Cons:** Tokens cannot be revoked once sent (unless a version/secret-per-user is used).

### Option B: Database-Stored Opaque Tokens
- Generate a random string (UUID/Secret), store it in a `tokens` table with an expiration date and user reference.
- **Pros:** Full control; can revoke tokens at any time; easy to track if a token was used.
- **Cons:** Requires database writes and lookups for every verification step.

**Recommendation:** **Option A** — Using signed JWTs for these flows is highly efficient and secure enough for StreamTube's use case, provided they are short-lived.

**Decision:** _[to be filled by user]_

---

## Decisions Summary

| ID | Decision | Recommendation | Choice |
|----|----------|---------------|--------|
| TD-01 | Authentication Strategy | Hybrid JWT + Refresh Token | _[pending]_ |
| TD-02 | Password Hashing Algorithm | Bcrypt | _[pending]_ |
| TD-03 | Token Storage & Delivery | HttpOnly Cookies | _[pending]_ |
| TD-04 | Account Confirmation & Recovery | Short-lived Signed JWTs | _[pending]_ |
