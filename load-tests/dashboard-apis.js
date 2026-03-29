import http from "k6/http";
import { sleep } from "k6";
import { BASE_URL, DASHBOARD_SESSION_TOKEN, thresholds } from "./config.js";
import { addAuthCookie, commonSummary, recordResponse } from "./helpers.js";
import { resolveLoad } from "./profiles.js";

const { vus, duration } = resolveLoad(20, "1m");

export const options = {
    vus,
    duration,
    thresholds,
};

export default function () {
    const params = addAuthCookie({ headers: { "Content-Type": "application/json" } }, DASHBOARD_SESSION_TOKEN);

    const leadsRes = http.get(`${BASE_URL}/api/v1/leads`, params);
    recordResponse(leadsRes, "dashboard_leads");

    const studentsRes = http.get(`${BASE_URL}/api/v1/students`, params);
    recordResponse(studentsRes, "dashboard_students");

    const feesRes = http.get(`${BASE_URL}/api/v1/fees`, params);
    recordResponse(feesRes, "dashboard_fees");

    const dashboardRes = http.get(`${BASE_URL}/api/v1/dashboard/metrics`, params);
    recordResponse(dashboardRes, "dashboard_metrics");

    sleep(2);
}

export const handleSummary = commonSummary("dashboard-apis");
