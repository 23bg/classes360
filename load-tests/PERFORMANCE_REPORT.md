# Classes360 Load Test Report (k6)

Date: 2026-03-14

## Test Scope Executed

Executed scenarios:

- public-pages (light)
- public-pages (medium)
- public-pages (heavy)
- student-portal (light)

Prepared but not executed in this run:

- lead-submission (mutating endpoint)
- dashboard-apis (requires authenticated staff session token)
- payment-flow (requires authenticated token and safe sandbox endpoints)

These scenarios are fully implemented and can be run with environment variables documented in `load-tests/README.md`.

## KPI Summary

| Scenario | Total Requests | RPS | Avg Latency (ms) | P95 Latency (ms) | Error % |
|---|---:|---:|---:|---:|---:|
| public-pages-light | 796 | 23.33 | 1546.08 | 3844.87 | 0.00 |
| public-pages-medium | 3220 | 46.11 | 3495.70 | 6748.30 | 0.00 |
| public-pages-heavy | 11094 | 86.35 | 5050.03 | 10934.79 | 0.00 |
| student-portal-light | 2010 | 62.38 | 428.28 | 755.28 | 0.00 |

## Threshold Evaluation

Configured thresholds:

- `http_req_duration: p(95) < 500ms`
- `http_req_failed: rate < 1%`

Result:

- Error-rate threshold passed in all executed scenarios.
- Latency threshold failed in all executed scenarios.

## Performance Analysis

### Slow Endpoints / Surfaces

1. Public institute pages under medium and heavy load show significant latency inflation.
2. Student portal pages are slower than target at light load, but remain stable with zero transport-level failures.

### Failure Behavior

1. No HTTP failure spikes were observed for executed read-only surfaces.
2. Primary issue is latency saturation, not outright endpoint failure.

### Probable Bottlenecks

1. Server-side render path and data-fetch latency on public pages under concurrency.
2. High dynamic route rendering and potential DB call fanout for institute pages.
3. Platform-level compute contention when VU count approaches heavy profile.

### CPU/Resource Estimate (Qualitative)

Given rising P95 with stable error rate, behavior suggests CPU and/or DB contention before hard failure:

- light: moderate headroom
- medium: pressure zone
- heavy: saturation zone with high queueing latency

## Scaling Recommendations

1. Add CDN edge caching and aggressive cache headers for read-mostly public routes.
2. Precompute/cache institute public payloads where possible.
3. Add route-level APM traces for `/i/[slug]` and `/i/[slug]/courses`.
4. Tune DB indexes and query response payload sizes for public-page dependencies.
5. Introduce autoscaling guardrails based on p95 and CPU thresholds.
6. Execute authenticated dashboard and payment tests in a staging sandbox to profile write-heavy behavior safely.

## Report Artifacts

Generated per scenario as both JSON and HTML:

- `load-tests/results/public-pages-light.json`
- `load-tests/results/public-pages-light.html`
- `load-tests/results/public-pages-medium.json`
- `load-tests/results/public-pages-medium.html`
- `load-tests/results/public-pages-heavy.json`
- `load-tests/results/public-pages-heavy.html`
- `load-tests/results/student-portal-light.json`
- `load-tests/results/student-portal-light.html`
