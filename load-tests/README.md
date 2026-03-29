# Classes360 Load Tests (k6)

This folder contains scenario-based k6 load tests for the Classes360 multi-tenant SaaS surfaces.

## Covered Surfaces

- Public institute pages
- Public lead submission API
- Dashboard APIs
- Student portal traffic
- Payment flow APIs

## Files

- `config.js`: shared environment and thresholds
- `profiles.js`: light/medium/heavy load profile resolver
- `helpers.js`: metrics helpers and report generation
- `public-pages.js`
- `lead-submission.js`
- `dashboard-apis.js`
- `student-portal.js`
- `payment-flow.js`
- `run-all.ps1`: executes all scenarios for all load levels

## Environment Variables

- `BASE_URL` (default: `https://classes360.online`)
- `PUBLIC_INSTITUTE_SLUG` (default: `kiran-academy`)
- `TEST_PHONE` (default: `9999999999`)
- `TEST_STUDENT_NAME` (default: `Test Student`)
- `TEST_COURSE_NAME` (default: `Java Fullstack`)
- `DASHBOARD_SESSION_TOKEN` (required for authenticated dashboard/payment APIs)
- `STUDENT_LOGIN_IDENTIFIER` (optional)
- `STUDENT_LOGIN_PASSWORD` (optional)
- `PAYMENT_CREATE_ENDPOINT` (default: `/api/v1/payment/create`)
- `PAYMENT_VERIFY_ENDPOINT` (default: `/api/v1/payment/verify`)
- `LOAD_LEVEL` (`light`, `medium`, `heavy`, or custom with `VUS` + `DURATION`)

## Scenarios

### Public page load test

```powershell
k6 run load-tests/public-pages.js
```

Default scenario profile for this script:
- 100 VUs
- 1 minute

### Lead submission test

```powershell
k6 run load-tests/lead-submission.js
```

Default scenario profile for this script:
- 50 VUs
- 1 minute

### Dashboard APIs test

```powershell
$env:DASHBOARD_SESSION_TOKEN="<valid_session_token>"
k6 run load-tests/dashboard-apis.js
```

Default scenario profile for this script:
- 20 VUs
- 1 minute
- each iteration sleeps 2 seconds

### Student portal test

```powershell
# Optional login credentials for API login burst
$env:STUDENT_LOGIN_IDENTIFIER="student@example.com"
$env:STUDENT_LOGIN_PASSWORD="secret123"
k6 run load-tests/student-portal.js
```

Default scenario profile for this script:
- 100 VUs
- 1 minute

### Payment flow test

```powershell
$env:DASHBOARD_SESSION_TOKEN="<valid_session_token>"
# Override endpoint names if your app differs
$env:PAYMENT_CREATE_ENDPOINT="/api/v1/billing"
$env:PAYMENT_VERIFY_ENDPOINT="/api/v1/billing/confirm"
k6 run load-tests/payment-flow.js
```

Default scenario profile for this script:
- 10 VUs
- 1 minute

## Load Levels

Apply global levels for any script:

```powershell
$env:LOAD_LEVEL="light"  # 50 users, 30s
k6 run load-tests/public-pages.js

$env:LOAD_LEVEL="medium" # 200 users, 1m
k6 run load-tests/public-pages.js

$env:LOAD_LEVEL="heavy"  # 500 users, 2m
k6 run load-tests/public-pages.js
```

## Reports

Each run writes:

- JSON: `load-tests/results/<scenario>.json`
- HTML: `load-tests/results/<scenario>.html`

Metrics include:
- average and percentile response times
- error rate (`http_req_failed`)
- request throughput (`http_reqs`)
- endpoint-tagged latency/failure counters

## Run all scripts across all load levels

```powershell
./load-tests/run-all.ps1
```

