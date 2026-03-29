# Classes360 All Test Cases Master List (Automation + Manual)

This is the exhaustive test inventory for this application, mapped to the recommended stack.

## Legend
- Priority: P0/P1/P2/P3
- Type: UNIT / API / UI / E2E / SEO
- Automation: V (Vitest), TL (Testing Library), P (Playwright), M (Manual)

---

## A) Public Website

- TC-PUB-001 | P1 | Home render baseline | UI/E2E | TL,P
- TC-PUB-002 | P1 | Header navigation links | E2E | P
- TC-PUB-003 | P1 | Footer legal links | E2E | P
- TC-PUB-004 | P1 | Pricing page loads | E2E | P
- TC-PUB-005 | P0 | Pricing shows Solo/Team values | UI/E2E | TL,P
- TC-PUB-006 | P1 | Pricing CTA routes to signup | E2E | P
- TC-PUB-007 | P1 | Features page content blocks visible | E2E | P
- TC-PUB-008 | P1 | Demo institute page reachable | E2E | P
- TC-PUB-009 | P0 | Institute slug page valid render `/i/[slug]` | E2E | P
- TC-PUB-010 | P1 | Invalid slug -> not found | E2E | P
- TC-PUB-011 | P1 | Public metadata title/description set | SEO | P,M

## B) Lead Capture (Public -> Dashboard)

- TC-LEAD-001 | P0 | Lead form valid submission | API/E2E | V,P
- TC-LEAD-002 | P1 | Lead form invalid phone/email | API/E2E | V,P
- TC-LEAD-003 | P1 | Duplicate lead handling by institute | API/E2E | V,P
- TC-LEAD-004 | P0 | Submitted lead appears in dashboard list | E2E | P
- TC-LEAD-005 | P1 | Lead source/course/message persistence | API | V

## C) Authentication + Session

- TC-AUTH-001 | P0 | Signup OTP request success | API/E2E | V,P
- TC-AUTH-002 | P0 | OTP verify success + onboarding redirect | API/E2E | V,P
- TC-AUTH-003 | P0 | Login OTP success + dashboard redirect | E2E | P
- TC-AUTH-004 | P0 | Invalid OTP denied | API/E2E | V,P
- TC-AUTH-005 | P1 | Expired OTP denied | API | V
- TC-AUTH-006 | P1 | OTP resend limit enforced | API/E2E | V,P
- TC-AUTH-007 | P1 | Logout clears session | API/E2E | V,P
- TC-AUTH-008 | P1 | Session cookie refresh on auth/me | API | V

## D) Onboarding + Institute

- TC-ONB-001 | P0 | Complete onboarding success | E2E | P
- TC-ONB-002 | P1 | Slug normalization and generation | UNIT | V
- TC-ONB-003 | P1 | Slug uniqueness conflict handling | API | V
- TC-ONB-004 | P1 | Resume onboarding for non-onboarded session | E2E | P
- TC-ONB-005 | P1 | Institute profile edit persists | API/E2E | V,P

## E) Dashboard Metrics and Widgets

- TC-DASH-001 | P1 | Metrics API returns non-negative values | API | V
- TC-DASH-002 | P1 | Today overview appears on dashboard | UI/E2E | TL,P
- TC-DASH-003 | P1 | Recent leads card loads | E2E | P
- TC-DASH-004 | P1 | Recent payments card loads | E2E | P
- TC-DASH-005 | P2 | Empty state copy shown when no data | UI/E2E | TL,P

## F) Leads Module

- TC-CRM-LEAD-001 | P0 | Lead list visible for institute | API/E2E | V,P
- TC-CRM-LEAD-002 | P1 | Search filter by name/phone | E2E | P
- TC-CRM-LEAD-003 | P1 | Status filter | E2E | P
- TC-CRM-LEAD-004 | P1 | Date range filter | E2E | P
- TC-CRM-LEAD-005 | P1 | Status update workflow | API/E2E | V,P
- TC-CRM-LEAD-006 | P1 | Notes/follow-up save | API/E2E | V,P

## G) Students Module

- TC-STU-001 | P0 | Create student | API/E2E | V,P
- TC-STU-002 | P0 | Edit student | API/E2E | V,P
- TC-STU-003 | P0 | Delete student | API/E2E | V,P
- TC-STU-004 | P1 | Course assignment persists | API/E2E | V,P
- TC-STU-005 | P1 | Batch assignment persists | API/E2E | V,P
- TC-STU-006 | P1 | CSV import valid rows success | API/E2E | V,P
- TC-STU-007 | P1 | CSV import invalid rows error report | API/E2E | V,P
- TC-STU-008 | P1 | Sample CSV download works | E2E | P

## H) Courses + Batches + Teachers

- TC-COURSE-001 | P1 | Course create/edit/delete | API/E2E | V,P
- TC-COURSE-002 | P1 | Course default fee impacts student form | E2E | P
- TC-BATCH-001 | P1 | Batch create/edit/delete | API/E2E | V,P
- TC-BATCH-002 | P1 | Teacher assignment to batch | API/E2E | V,P
- TC-TEACH-001 | P1 | Teacher create/edit/delete | API/E2E | V,P

## I) Fees + Installments + Payments

- TC-FEE-001 | P0 | Fee plan create with due date | API/E2E | V,P
- TC-FEE-002 | P0 | Add payment installment and save | API/E2E | V,P
- TC-FEE-003 | P1 | Payment method/reference persistence | API/E2E | V,P
- TC-FEE-004 | P1 | Fee pending/paid calculations | UNIT/API | V
- TC-FEE-005 | P1 | Defaulter list accuracy | API | V
- TC-PAY-001 | P0 | Payments page list displays latest entries | E2E | P
- TC-PAY-002 | P1 | Payment filters method/date/student | API/E2E | V,P

## J) Team and Access Control

- TC-TEAM-001 | P0 | Owner add team member | API/E2E | V,P
- TC-TEAM-002 | P0 | Owner edit role | API/E2E | V,P
- TC-TEAM-003 | P0 | Owner delete member | API/E2E | V,P
- TC-TEAM-004 | P0 | Non-owner management forbidden | API/E2E | V,P
- TC-TEAM-005 | P0 | SOLO limit blocks 2nd user | API/E2E | V,P
- TC-TEAM-006 | P0 | TEAM limit blocks 6th user | API/E2E | V,P

## K) Billing + Trial + Subscription

- TC-BILL-001 | P0 | Trial auto-created for new institute | API | V
- TC-BILL-002 | P0 | Trial defaults SOLO + limit 1 + 14 days | UNIT/API | V
- TC-BILL-003 | P0 | Trial expiry date flips status to INACTIVE | API | V
- TC-BILL-004 | P0 | Inactive redirected to billing route | E2E | P
- TC-BILL-005 | P0 | Billing summary values correctness | API/UI | V,TL
- TC-BILL-006 | P0 | Create SOLO Razorpay subscription | API | V
- TC-BILL-007 | P0 | Create TEAM Razorpay subscription | API | V
- TC-BILL-008 | P1 | Reuse existing sub id when same plan | API | V
- TC-BILL-009 | P1 | Plan switch updates planType and userLimit | API | V
- TC-BILL-010 | P0 | Webhook activated -> ACTIVE | API | V
- TC-BILL-011 | P0 | Webhook cancelled -> CANCELLED | API | V
- TC-BILL-012 | P0 | Webhook payment.failed -> INACTIVE | API | V
- TC-BILL-013 | P1 | Unsupported webhook event rejected | API | V
- TC-BILL-014 | P1 | Billing INACTIVE banner shown | UI/E2E | TL,P

## L) API Contract + Security

- TC-API-001 | P0 | Unauthorized access returns 401 | API | V
- TC-API-002 | P1 | Invalid payload returns 400-class error | API | V
- TC-API-003 | P0 | Cross-institute data isolation | API | V
- TC-API-004 | P1 | Input validation prevents malformed writes | API | V
- TC-API-005 | P1 | Error body shape stable `{success,error}` | API | V

## M) SEO + Indexing

- TC-SEO-001 | P0 | robots.txt reachable | SEO/E2E | P
- TC-SEO-002 | P0 | sitemap.xml reachable | SEO/E2E | P
- TC-SEO-003 | P0 | sitemap has `/i/{slug}` URLs only | SEO/API | V,P
- TC-SEO-004 | P1 | new onboarded institute appears in sitemap | SEO/API | V,P
- TC-SEO-005 | P1 | sitemap includes static marketing pages | SEO/API | V

## N) Stability + Build + Production Smoke

- TC-STAB-001 | P0 | `pnpm build` succeeds | Build | M
- TC-STAB-002 | P1 | Production startup succeeds | Build | M
- TC-STAB-003 | P0 | Critical smoke path (auth->onboarding->lead->billing) | E2E | P
- TC-STAB-004 | P1 | Deep-link refresh across protected routes | E2E | P
- TC-STAB-005 | P2 | Mobile viewport sanity | E2E | P

---

## 6) Minimum mandatory automation before release

Must be automated and passing:
- All `TC-*-P0` in Auth, Billing, Team Limits, Lead Capture, Payments
- SEO P0 (`robots`, `sitemap`, institute URL format)
- Build smoke

---

## 7) Suggested tagging convention

- `@p0`, `@p1`, `@billing`, `@auth`, `@seo`, `@smoke`

Use in Playwright/Vitest to run focused suites during release windows.
