import { check } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const endpointLatency = new Trend("endpoint_latency", true);
export const endpointFailures = new Counter("endpoint_failures");
export const endpointSuccessRate = new Rate("endpoint_success_rate");

export function recordResponse(res, endpointName) {
    endpointLatency.add(res.timings.duration, { endpoint: endpointName });

    const ok = check(res, {
        [`${endpointName} status is < 400`]: (r) => r.status < 400,
    });

    endpointSuccessRate.add(ok, { endpoint: endpointName });
    if (!ok) {
        endpointFailures.add(1, { endpoint: endpointName, status: String(res.status) });
    }

    return ok;
}

export function commonSummary(name) {
    return function handleSummary(data) {
        const level = (__ENV.LOAD_LEVEL || "scenario").toLowerCase();
        const filePrefix = `${name}-${level}`;
        return {
            [`load-tests/results/${filePrefix}.json`]: JSON.stringify(data, null, 2),
            [`load-tests/results/${filePrefix}.html`]: htmlReport(data),
            stdout: `\n${name} (${level}) complete. JSON/HTML reports saved in load-tests/results\n`,
        };
    };
}

export function addAuthCookie(params, token) {
    if (!token) return params;

    const headers = params.headers || {};
    headers.Cookie = `session_token=${token}`;

    return {
        ...params,
        headers,
    };
}
