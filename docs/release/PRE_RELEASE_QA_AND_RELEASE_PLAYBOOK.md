# Classes360 Master Test Case Suite + Pre-Release Playbook (Senior QA)

## 1) Quality gate and release policy

Release is allowed only when:

- All **P0** cases pass
- At least **95% of P1** cases pass (with no unresolved customer-facing regressions)
- No open security/privacy blocker
- Build + smoke + rollback validation complete

Severity model:

- **P0 (Blocker):** prevents core usage or causes data loss/revenue risk
- **P1 (High):** major flow degradation, workaround exists
- **P2 (Medium):** minor functional/UX issue
- **P3 (Low):** polish issue

---

## 2) Environments, accounts, fixtures

### Environments

- Local: `pnpm dev`
- Staging: production-like data + integrations
- Production build check: `pnpm build && pnpm start`

### Required accounts

- `owner_fresh` (new signup)
- `owner_onboarded_trial`
- `owner_onboarded_active`
- `team_viewer`
- `team_editor` (mapped role)

### Required data fixtures

- 2 institutes with valid slugs
- 3 courses, 2 batches, 2 teachers
- 10 students minimum
- 10 leads minimum
- 5 fee plans, 10 installments
- 5 payment records with mixed methods

### Billing fixture requirements

- One institute on SOLO (limit 1)
- One institute on TEAM (limit 5)
- One institute with expired trial date

---

## 3) Execution protocol

For every case record:

- Case ID
- Priority
- Module
- Preconditions
- Test steps
- Expected result
- Actual result
- Evidence link
- Owner
- Status: PASS / FAIL / BLOCKED

Exit criteria:

- P0 fail => **NO-GO**
- P1 fail in billing/auth/lead/payment => **NO-GO**
- Any data corruption => **NO-GO**

---

## 4) Master route coverage (must be tested)

### Public routes

- `/`
- `/features`
- `/pricing`
- `/demo-institute`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/i/{slug}`
- `/{slug}/lead`

### Auth + onboarding

- `/login`
- `/signup`
- `/verification`
- `/onboarding`

### Dashboard routes

- `/`
- `/leads`
- `/students`
- `/courses`
- `/batches`
- `/fees`
- `/payments`
- `/team`
- `/institute`
- `/settings`
- `/billing`

### SEO/system endpoints

- `/robots.txt`
- `/sitemap.xml`

---

## 5) Detailed test cases (execution-ready)

## A. Public experience

### A1. Landing and nav

**TC-PUB-001 (P1) Home renders**

- Preconditions: app running
- Steps: Open `/`
- Expected: No crash, all landing sections load

**TC-PUB-002 (P1) Header links**

- Steps: Click Home, Features, Pricing, Demo
- Expected: Correct routes and page headings

**TC-PUB-003 (P1) CTA navigation**

- Steps: Click Login and Start Free Trial
- Expected: route to `/login`, `/signup`

**TC-PUB-004 (P2) Footer legal links**

- Expected: About/Contact/Privacy/Terms all open

### A2. Pricing

**TC-PUB-010 (P0) Plan cards visible**

- Steps: Open `/pricing`
- Expected: Solo ₹499 and Team ₹999 visible

**TC-PUB-011 (P1) Plan metadata correctness**

- Expected: user limit text aligns to plan (Solo=1, Team=5)

**TC-PUB-012 (P1) Pricing CTA path**

- Steps: Start Solo Trial / Start Team Trial
- Expected: redirect `/signup`

### A3. Institute public page

**TC-PUB-020 (P0) Valid institute slug page**

- Steps: Open `/i/{valid-slug}`
- Expected: institute profile + sections render

**TC-PUB-021 (P1) Invalid slug behavior**

- Steps: Open `/i/{invalid-slug}`
- Expected: not found page

**TC-PUB-022 (P1) Contact links**

- Expected: phone/whatsapp/contact links open correctly

### A4. Lead form

**TC-PUB-030 (P0) Lead submission success**

- Steps: Open `/{slug}/lead`, submit valid payload
- Expected: success message + lead saved

**TC-PUB-031 (P0) Lead appears in CRM**

- Steps: Owner opens `/leads`
- Expected: newly created lead visible with source and timestamp

**TC-PUB-032 (P1) Lead validation**

- Steps: invalid phone/email
- Expected: validation error, no record persisted

**TC-PUB-033 (P1) Duplicate lead behavior**

- Steps: submit same phone for same institute
- Expected: product-defined duplicate handling (error or update path)

---

## B. Auth and onboarding

### B1. OTP auth

**TC-AUTH-001 (P0) Signup OTP success**

- Steps: request otp from `/signup`, verify valid OTP
- Expected: session created, onboarding redirect

**TC-AUTH-002 (P0) Login OTP success**

- Steps: request otp from `/login`, verify valid OTP
- Expected: dashboard redirect for onboarded + active/trial

**TC-AUTH-003 (P0) Invalid OTP**

- Steps: wrong OTP
- Expected: unauthorized error, no session

**TC-AUTH-004 (P1) Expired OTP**

- Steps: wait expiry and verify
- Expected: expired message

**TC-AUTH-005 (P1) OTP resend limits**

- Steps: resend beyond max limit
- Expected: limit error returned

### B2. Onboarding

**TC-ONB-001 (P0) Onboarding complete**

- Steps: submit institute details
- Expected: `isOnboarded=true`, slug generated, redirect dashboard

**TC-ONB-002 (P1) Slug conflict**

- Steps: set already-used slug
- Expected: conflict response

**TC-ONB-003 (P1) Resume onboarding**

- Steps: partially onboarded user relogin
- Expected: redirected to `/onboarding`

---

## C. Dashboard + CRM modules

### C1. Dashboard summary

**TC-DASH-001 (P1) Summary metrics render**
- Expected: no NaN/blank in cards

**TC-DASH-002 (P1) Today overview**
- Expected: leads, fees, dues, students values visible

**TC-DASH-003 (P1) Recent widgets**
- Expected: recent leads/payments lists load

### C2. Leads

**TC-LEAD-001 (P0) Add lead in dashboard**
- Expected: row added

**TC-LEAD-002 (P1) Filter/search leads**
- Steps: query + status + date filters
- Expected: accurate filtered list

**TC-LEAD-003 (P1) Update status**
- Steps: NEW->CONTACTED->ADMITTED/DROPPED
- Expected: persisted status

**TC-LEAD-004 (P1) Notes + follow-up**
- Expected: both fields persist and reload

### C3. Students

**TC-STU-001 (P0) Student CRUD**
- Expected: create/edit/delete works

**TC-STU-002 (P1) Course-batch mapping**
- Expected: assignment visible in list/details

**TC-STU-003 (P1) CSV import valid file**
- Expected: rows inserted and summary shown

**TC-STU-004 (P1) CSV import invalid rows**
- Expected: row-level errors surfaced

### C4. Courses and batches

**TC-COURSE-001 (P1) Course create/edit/delete**
- Expected: CRUD stable

**TC-BATCH-001 (P1) Batch create/edit**
- Expected: persisted changes

**TC-BATCH-002 (P1) Teacher assignment**
- Expected: teacher linkage visible

### C5. Fees and payments

**TC-FEE-001 (P0) Fee plan create**
- Expected: total amount and due date saved

**TC-FEE-002 (P0) Add installment/payment**
- Expected: installment + payment history consistency

**TC-FEE-003 (P1) Defaulter calculations**
- Expected: pending amount calculations correct

**TC-PAY-001 (P0) Payments page list**
- Expected: latest payments visible

**TC-PAY-002 (P1) Payment filters**
- Steps: method/date/student filter
- Expected: exact filtered rows

### C6. Team

**TC-TEAM-001 (P0) Owner can manage team**
- Expected: create/edit/delete allowed for owner

**TC-TEAM-002 (P0) Non-owner restrictions**
- Expected: forbidden operations for non-owner

**TC-TEAM-003 (P0) SOLO limit enforcement**
- Steps: add 2nd user on solo
- Expected: `PLAN_USER_LIMIT_REACHED`

**TC-TEAM-004 (P0) TEAM limit enforcement**
- Steps: add 5 users, try 6th
- Expected: 6th blocked

---

## D. Billing, trial, and subscription controls

### D1. Trial lifecycle

**TC-BILL-001 (P0) Auto trial bootstrap**
- Expected: new institute gets TRIAL + SOLO + userLimit=1 + trialEndsAt set

**TC-BILL-002 (P0) Trial expiry by date**
- Preconditions: past `trialEndsAt`
- Steps: call billing/auth/me flows
- Expected: status flips to INACTIVE

**TC-BILL-003 (P0) Inactive routing**
- Steps: open protected routes as inactive user
- Expected: redirect `/billing`

### D2. Upgrade and plan selection

**TC-BILL-010 (P0) Solo plan create/reuse**
- Expected: Razorpay SOLO plan id used

**TC-BILL-011 (P0) Team plan create/reuse**
- Expected: Razorpay TEAM plan id used

**TC-BILL-012 (P1) Billing summary correctness**
- Expected: plan, status, users used/limit, next date accurate

### D3. Webhook status transitions

**TC-BILL-020 (P0) subscription.activated => ACTIVE**

**TC-BILL-021 (P0) subscription.cancelled => CANCELLED**

**TC-BILL-022 (P0) payment.failed => INACTIVE**

**TC-BILL-023 (P1) Unsupported event handling**
- Expected: proper error response, no invalid state update

### D4. Session freshness

**TC-BILL-030 (P1) auth/me refreshes stale session status**
- Preconditions: cookie has stale status
- Expected: response and refreshed cookie reflect DB status

---

## E. API contract and negative tests

**TC-API-001 (P0) Unauthorized APIs return 401**
- Scope: billing, teams, students, leads, fees, payments

**TC-API-002 (P1) Invalid payload returns 400/422 style error**

**TC-API-003 (P1) Ownership scoping**
- Expected: institute A cannot mutate institute B data

**TC-API-004 (P1) Idempotency where applicable**
- Expected: repeat action does not duplicate unintended records

---

## F. SEO, crawlability, discoverability

**TC-SEO-001 (P0) robots reachable**
- `/robots.txt` responds and includes sitemap pointer

**TC-SEO-002 (P0) sitemap reachable**
- `/sitemap.xml` responds with valid URL entries

**TC-SEO-003 (P0) institute URL format**
- Expected: `/i/{slug}` URLs in sitemap

**TC-SEO-004 (P1) new slug appears in sitemap**
- Create onboarded institute -> check sitemap contains it

**TC-SEO-005 (P1) public metadata sanity**
- Home/pricing/institute pages have non-empty title/description

---

## G. Stability, regression, and release confidence

**TC-STAB-001 (P0) Logout/login stability**

**TC-STAB-002 (P1) Production build success (`pnpm build`)**

**TC-STAB-003 (P1) Production smoke (`pnpm start`)**

**TC-STAB-004 (P1) Browser refresh deep-link stability**
- Open deep dashboard routes directly

**TC-STAB-005 (P2) Mobile viewport sanity**
- key pages render without layout break

---

## 6) Manual QA prompt (non-code review)

```text
You are a senior QA engineer testing a SaaS product.

IMPORTANT:
Test product behavior only.
Do not review source code.

Cover modules:
Public pages, auth, onboarding, dashboard, leads, students, courses,
batches, fees, payments, team, billing, SEO endpoints.

For each module report:
- Pass/Fail
- Edge-case behavior
- Error handling quality
- Risks

Must verify explicitly:
- Trial creation and date-based expiry
- Plan limits (Solo=1, Team=5)
- Billing upgrades and webhook effects
- OTP limits and failures
- Lead capture to CRM path

Final output:
1) Working features
2) Broken features
3) Missing features
4) Risk areas
5) Readiness score (0-100)
6) GO / NO-GO recommendation
```

---

## 7) Release workflow (dev -> main)

1. Feature branch development
2. Merge to `dev`
3. Execute full P0/P1 suite on staging
4. Fix issues and re-run impacted regression
5. Run `pnpm build`
6. Pre-prod smoke
7. Merge `dev -> main`
8. Deploy
9. Post-deploy smoke (public + auth + billing + lead capture)

Rollback policy:

- Any P0 post-release issue => rollback immediately

---

## 8) GSC indexing strategy (dynamic institute pages)

Required:

- Dynamic sitemap at `/sitemap.xml`
- Robots at `/robots.txt`
- Canonical institute path `/i/{slug}`

Discovery method:

- Submit `https://classes360.online/sitemap.xml` once in GSC
- Ensure new onboarded slugs are auto-added to sitemap
- Re-crawl follows sitemap updates

---

## 9) Sign-off template

- Build: PASS / FAIL
- P0: PASS / FAIL
- P1: PASS / FAIL
- Billing + trial: PASS / FAIL
- SEO indexing readiness: PASS / FAIL
- Security/privacy blockers: YES / NO
- Final decision: GO / NO-GO
- QA Owner:
- Product Owner:
- Date:
