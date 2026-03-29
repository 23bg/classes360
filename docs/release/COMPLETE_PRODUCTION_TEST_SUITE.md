# COMPLETE PRODUCTION SAAS TEST SUITE — ONCAMPUS

This document defines full pre-release behavioral test cases for Classes360.

- Scope: behavior only (no code quality review)
- Target: 90%+ feature coverage
- Priority labels: P0 (critical), P1 (high), P2 (medium)

---

## SECTION 1 — Unit Tests

## 1.1 Services

### `auth.service`

- UT-AUTH-SVC-001 (P0) requestOtp success
  - Preconditions: valid email, rate limit available
  - Steps: call `requestOtp({email, ip})`
  - Expected: returns `expiresAt`, OTP stored/sent

- UT-AUTH-SVC-002 (P0) requestOtp invalid email
  - Steps: call with malformed email
  - Expected: throws `INVALID_EMAIL`

- UT-AUTH-SVC-003 (P1) requestOtp rate limit hit
  - Steps: exceed per-minute requests
  - Expected: throws `RATE_LIMITED`

- UT-AUTH-SVC-004 (P1) requestOtp resend limit hit
  - Preconditions: active OTP exists, resend count at max
  - Expected: throws `OTP_RESEND_LIMIT`

- UT-AUTH-SVC-005 (P0) verifyOtp success existing onboarded user
  - Preconditions: valid OTP + user + institute exists + active/trial
  - Expected: session cookie set, redirect `/dashboard`

- UT-AUTH-SVC-006 (P0) verifyOtp success new institute assignment
  - Preconditions: valid OTP, user has no institute
  - Expected: institute created, role OWNER, redirect `/onboarding`

- UT-AUTH-SVC-007 (P0) verifyOtp invalid/expired
  - Expected: throws `INVALID_OTP`

- UT-AUTH-SVC-008 (P1) verifyOtp user missing after OTP validation
  - Expected: throws `USER_NOT_FOUND`

### `subscription.service`

- UT-SUB-SVC-001 (P0) resolvePlanType valid values
- UT-SUB-SVC-002 (P1) resolvePlanType fallback to SOLO on invalid
- UT-SUB-SVC-003 (P0) getRazorpayPlanId SOLO returns env SOLO
- UT-SUB-SVC-004 (P0) getRazorpayPlanId TEAM returns env TEAM
- UT-SUB-SVC-005 (P0) getRazorpayPlanId missing env throws `RAZORPAY_PLAN_ID_MISSING`
- UT-SUB-SVC-006 (P0) getSubscription creates trial when missing
- UT-SUB-SVC-007 (P0) syncTrialStatus expires trial to INACTIVE when date passed
- UT-SUB-SVC-008 (P1) syncTrialStatus keeps TRIAL when date not passed
- UT-SUB-SVC-009 (P0) getBillingSummary shape correctness (plan, users, status)
- UT-SUB-SVC-010 (P0) createRazorpaySubscription reuses existing sub for same plan
- UT-SUB-SVC-011 (P0) createRazorpaySubscription creates new sub for changed plan
- UT-SUB-SVC-012 (P0) webhook event map active/cancelled/failed correctness
- UT-SUB-SVC-013 (P1) unsupported webhook event throws `UNSUPPORTED_WEBHOOK_EVENT`
- UT-SUB-SVC-014 (P0) webhook update by institute+subid uses upsert path
- UT-SUB-SVC-015 (P0) webhook with no target throws `SUBSCRIPTION_TARGET_MISSING`

### `lead.service`

- UT-LEAD-SVC-001 (P0) createLead success with NEW status
- UT-LEAD-SVC-002 (P1) createLead validation error for invalid phone
- UT-LEAD-SVC-003 (P0) createLeadBySlug success
- UT-LEAD-SVC-004 (P0) createLeadBySlug invalid slug throws `INSTITUTE_NOT_FOUND`
- UT-LEAD-SVC-005 (P1) updateStatus non-ADMITTED path updates lead
- UT-LEAD-SVC-006 (P0) updateStatus ADMITTED converts to student
- UT-LEAD-SVC-007 (P0) ADMITTED duplicate student throws `DUPLICATE_STUDENT`
- UT-LEAD-SVC-008 (P1) updateLead notes/followUp update success
- UT-LEAD-SVC-009 (P1) updateLead empty payload throws `INVALID_UPDATE`
- UT-LEAD-SVC-010 (P1) exportLeads maps null email/source to empty string

### `student.service`

- UT-STU-SVC-001 (P0) createStudent success
- UT-STU-SVC-002 (P0) duplicate phone in institute blocked
- UT-STU-SVC-003 (P1) updateStudent success
- UT-STU-SVC-004 (P1) updateStudent not found returns error
- UT-STU-SVC-005 (P1) deleteStudent success
- UT-STU-SVC-006 (P1) listStudents filter/search works
- UT-STU-SVC-007 (P1) uploadStudents CSV valid rows inserted
- UT-STU-SVC-008 (P1) uploadStudents invalid rows collected in error report

### `fee.service`

- UT-FEE-SVC-001 (P0) createPlan success
- UT-FEE-SVC-002 (P0) addPayment creates installment + payment record
- UT-FEE-SVC-003 (P1) addPayment default date to now
- UT-FEE-SVC-004 (P1) addPayment with method/reference persisted
- UT-FEE-SVC-005 (P1) markInstallmentPaid updates status and paidOn
- UT-FEE-SVC-006 (P1) updateInstallmentStatus PAID sets paidOn
- UT-FEE-SVC-007 (P1) getStudentPaymentSummary totals accurate
- UT-FEE-SVC-008 (P1) listPayments filters from/to/student/method

### `team.service`

- UT-TEAM-SVC-001 (P0) listMembers returns institute users
- UT-TEAM-SVC-002 (P0) createMember non-owner blocked
- UT-TEAM-SVC-003 (P0) createMember assigned-to-other-institute blocked
- UT-TEAM-SVC-004 (P0) createMember solo limit reached throws `PLAN_USER_LIMIT_REACHED`
- UT-TEAM-SVC-005 (P0) createMember updates existing in same institute
- UT-TEAM-SVC-006 (P0) createMember creates new when seat available
- UT-TEAM-SVC-007 (P1) updateMemberRole self-change blocked
- UT-TEAM-SVC-008 (P1) updateMemberRole not found error
- UT-TEAM-SVC-009 (P1) removeMember self-remove blocked
- UT-TEAM-SVC-010 (P1) removeMember not found error

### `billing.service` (or billing summary layer)

- UT-BILL-SVC-001 (P0) get summary returns plan + status + usage
- UT-BILL-SVC-002 (P0) create subscription action routes by plan
- UT-BILL-SVC-003 (P1) invalid action rejected
- UT-BILL-SVC-004 (P1) invalid plan rejected

### `course.service`

- UT-COURSE-SVC-001 (P1) createCourse success
- UT-COURSE-SVC-002 (P1) updateCourse success
- UT-COURSE-SVC-003 (P1) deleteCourse success
- UT-COURSE-SVC-004 (P1) listCourses scoped by institute

### `batch.service`

- UT-BATCH-SVC-001 (P1) createBatch success
- UT-BATCH-SVC-002 (P1) updateBatch success
- UT-BATCH-SVC-003 (P1) deleteBatch success
- UT-BATCH-SVC-004 (P1) teacher assignment persists

## 1.2 Repositories

### `auth.repo` / user + otp repository behavior

- UT-AUTH-REPO-001 create user
- UT-AUTH-REPO-002 find by email normalized
- UT-AUTH-REPO-003 update by email
- UT-AUTH-REPO-004 list by institute
- UT-AUTH-REPO-005 count by institute
- UT-AUTH-REPO-006 otp save and latest fetch
- UT-AUTH-REPO-007 otp verify success/failure

### `lead.repo`

- UT-LEAD-REPO-001 create
- UT-LEAD-REPO-002 findByPhoneInInstitute
- UT-LEAD-REPO-003 updateStatus
- UT-LEAD-REPO-004 updateByIdInInstitute message/followUp/status
- UT-LEAD-REPO-005 list with filters query/status/date

### `student.repo`

- UT-STU-REPO-001 create
- UT-STU-REPO-002 update
- UT-STU-REPO-003 delete
- UT-STU-REPO-004 list by institute
- UT-STU-REPO-005 duplicate phone check

### `subscription.repo`

- UT-SUB-REPO-001 createTrial upsert
- UT-SUB-REPO-002 findByInstituteId
- UT-SUB-REPO-003 updateByInstituteId
- UT-SUB-REPO-004 upsertByRazorpaySubId
- UT-SUB-REPO-005 updateByRazorpaySubId

### `team.repo` (user repository team operations)

- UT-TEAM-REPO-001 updateByIdAndInstitute
- UT-TEAM-REPO-002 removeByIdAndInstitute
- UT-TEAM-REPO-003 institute scoping correctness

### `fee.repo`

- UT-FEE-REPO-001 createPlan
- UT-FEE-REPO-002 createInstallment
- UT-FEE-REPO-003 createPaymentRecord
- UT-FEE-REPO-004 listPaymentsByInstitute filters
- UT-FEE-REPO-005 aggregation totals collected/outstanding
- UT-FEE-REPO-006 due count on date

## 1.3 Utilities

- UT-UTIL-001 AppError construction
- UT-UTIL-002 toAppError wraps unknown errors
- UT-UTIL-003 slug normalization utility (if available)
- UT-UTIL-004 rate limiter utility allows/blocks correctly
- UT-UTIL-005 logger helpers do not throw
- UT-UTIL-006 date conversion helper (if available) timezone-safe

## 1.4 Validations (`validations/*`)

- UT-VAL-AUTH-001 requestOtp schema valid email
- UT-VAL-AUTH-002 requestOtp invalid email
- UT-VAL-LEAD-001 lead schema valid
- UT-VAL-LEAD-002 lead invalid phone
- UT-VAL-STU-001 student schema valid
- UT-VAL-STU-002 student invalid/missing required fields
- UT-VAL-INST-001 institute schema valid
- UT-VAL-INST-002 invalid slug/field constraints

---

## SECTION 2 — API Tests

All API tests should validate:
- status code
- response contract `{ success, data|error }`
- institute scoping
- auth/role behavior

## 2.1 `/api/v1/auth`

- API-AUTH-001 POST `/auth/request-otp` valid email -> 200
- API-AUTH-002 POST `/auth/request-otp` invalid email -> 400
- API-AUTH-003 POST `/auth/request-otp` rate limit exceeded -> 429
- API-AUTH-004 POST `/auth/verify-otp` valid -> 200 + session cookie
- API-AUTH-005 POST `/auth/verify-otp` invalid -> 401
- API-AUTH-006 GET `/auth/me` with session -> 200 + user payload
- API-AUTH-007 GET `/auth/me` without session -> 401
- API-AUTH-008 POST `/auth/logout` clears session
- API-AUTH-009 POST `/auth/refresh-token` valid refresh -> 200
- API-AUTH-010 POST `/auth/refresh-token` invalid -> 401

## 2.2 `/api/v1/institute`

- API-INS-001 POST onboarding valid -> 200
- API-INS-002 POST onboarding duplicate slug -> 409
- API-INS-003 GET institute authorized -> 200
- API-INS-004 PATCH institute update valid -> 200
- API-INS-005 institute endpoint unauthorized -> 401

## 2.3 `/api/v1/leads`

- API-LEAD-001 POST lead valid -> 201/200
- API-LEAD-002 POST lead invalid payload -> 400
- API-LEAD-003 GET leads list -> 200
- API-LEAD-004 GET leads with filters -> 200 filtered
- API-LEAD-005 PATCH lead status -> 200
- API-LEAD-006 PATCH lead notes/followUp -> 200
- API-LEAD-007 DELETE lead -> success code
- API-LEAD-008 wrong institute lead update blocked

## 2.4 `/api/v1/students`

- API-STU-001 POST student valid -> success
- API-STU-002 POST student duplicate phone -> 409
- API-STU-003 GET students -> 200
- API-STU-004 PATCH student -> 200
- API-STU-005 DELETE student -> 200
- API-STU-006 POST upload valid csv -> inserted count
- API-STU-007 POST upload invalid csv -> error rows

## 2.5 `/api/v1/courses`

- API-COURSE-001 POST create
- API-COURSE-002 GET list
- API-COURSE-003 PATCH update
- API-COURSE-004 DELETE remove

## 2.6 `/api/v1/batches`

- API-BATCH-001 POST create
- API-BATCH-002 GET list
- API-BATCH-003 PATCH update
- API-BATCH-004 DELETE remove

## 2.7 `/api/v1/fees`

- API-FEE-001 POST fee plan create
- API-FEE-002 PATCH fee plan update
- API-FEE-003 POST installment/payment create
- API-FEE-004 PATCH installment update
- API-FEE-005 fee plan not found -> 404

## 2.8 `/api/v1/payments`

- API-PAY-001 POST payment create (if endpoint supports)
- API-PAY-002 GET payments list
- API-PAY-003 GET payments filtered method/date/student

## 2.9 `/api/v1/billing`

- API-BILL-001 GET billing summary authorized
- API-BILL-002 POST action `create-subscription` SOLO
- API-BILL-003 POST action `create-subscription` TEAM
- API-BILL-004 POST invalid action -> 400
- API-BILL-005 POST invalid planType -> 400
- API-BILL-006 unauthorized billing -> 401

## 2.10 `/api/v1/webhooks/razorpay`

- API-WEBHOOK-001 missing signature -> 400
- API-WEBHOOK-002 invalid signature -> 401
- API-WEBHOOK-003 `subscription.activated` -> status ACTIVE
- API-WEBHOOK-004 `subscription.cancelled` -> status CANCELLED
- API-WEBHOOK-005 `payment.failed` -> status INACTIVE
- API-WEBHOOK-006 unsupported event -> error response

---

## SECTION 3 — Integration Tests

- INT-001 Signup -> OTP verify -> onboarding -> dashboard route
- INT-002 Public lead form submit -> lead appears in dashboard leads
- INT-003 Lead status ADMITTED -> student created
- INT-004 Student create -> fee plan create -> installment/payment recorded
- INT-005 Plan upgrade SOLO -> TEAM updates userLimit and summary
- INT-006 Trial expiry date crossed -> subscription INACTIVE -> redirected billing
- INT-007 Team invite under SOLO beyond 1 seat blocked
- INT-008 TEAM allows 5 seats, blocks 6th
- INT-009 Razorpay webhook updates billing status reflected in UI
- INT-010 auth/me refreshes stale subscription status cookie

---

## SECTION 4 — E2E Tests

Use Playwright with tags `@p0`, `@smoke`, `@billing`, `@seo`.

- E2E-001 User Signup flow (request OTP -> verify -> onboarding)
- E2E-002 User Login flow (OTP -> redirect dashboard)
- E2E-003 Onboarding completion flow
- E2E-004 Public lead capture flow `/{slug}/lead`
- E2E-005 Student CRUD flow (create/edit/delete)
- E2E-006 Course CRUD flow
- E2E-007 Batch CRUD flow + teacher assignment
- E2E-008 Fee creation flow + installment/payment
- E2E-009 Payments view/filter flow
- E2E-010 Billing upgrade SOLO flow
- E2E-011 Billing upgrade TEAM flow
- E2E-012 Trial expiry flow with INACTIVE banner + restricted navigation
- E2E-013 Team limit flow SOLO/TEAM
- E2E-014 Logout/login session persistence and guards

### E2E performance assertions

- E2E-PERF-001 Landing fully interactive < 2s (95th percentile)
- E2E-PERF-002 Dashboard initial data visible < 2s
- E2E-PERF-003 Leads table first render < 2s on baseline dataset

---

## SECTION 5 — SEO Tests

- SEO-001 `/robots.txt` reachable and includes sitemap URL
- SEO-002 `/sitemap.xml` reachable and valid XML structure
- SEO-003 sitemap contains public static routes (home/pricing/features/demo/legal)
- SEO-004 sitemap institute URLs are `/i/{slug}` only
- SEO-005 new onboarded institute slug appears in sitemap automatically
- SEO-006 `/i/{slug}` returns crawlable metadata (title/description)

---

## SECTION 6 — Security Tests

- SEC-001 Unauthorized API access for protected endpoints returns 401
- SEC-002 Expired/invalid token cannot access protected endpoints
- SEC-003 Wrong institute scoping blocked for all mutate endpoints
- SEC-004 Role access control:
  - Owner can manage team/billing
  - Editor/Viewer restricted where expected
- SEC-005 Webhook signature verification enforced
- SEC-006 Input validation blocks malformed payloads
- SEC-007 Session fixation/regeneration check on login
- SEC-008 Sensitive endpoints do not leak internal error details

---

## SECTION 7 — Edge Case Tests

- EDGE-001 Empty database dashboards and lists show stable empty states
- EDGE-002 Large student list (10k) pagination/filter responsiveness
- EDGE-003 Large lead list (10k) search/filter correctness
- EDGE-004 Duplicate institute slug conflict path
- EDGE-005 Duplicate student phone conflict path
- EDGE-006 Duplicate lead phone behavior in institute scope
- EDGE-007 Expired trial with stale session token refresh path
- EDGE-008 Invalid Razorpay webhook payload body shape
- EDGE-009 Webhook for unknown institute/subscription target
- EDGE-010 Network timeout/retry behavior on billing create-subscription
- EDGE-011 CSV upload mixed valid/invalid lines with partial success
- EDGE-012 Date boundary cases (month end, timezone offsets)

---

## SECTION 8 — Coverage Summary

Target coverage matrix:

- Unit tests: all core services, repositories, validations, utils
- API tests: all listed `/api/v1/*` route groups
- Integration tests: 10 critical cross-module business flows
- E2E tests: 14 user journeys + 3 performance checks
- SEO tests: discovery + indexing correctness
- Security tests: authz/authn/scoping/webhook signatures
- Edge tests: scale, duplicates, expiry, invalid payloads

Release criteria:

- 100% P0 pass
- >=95% P1 pass
- No open security blocker
- Build + smoke green

Estimated feature coverage: **90%+** of production behavior surface.
