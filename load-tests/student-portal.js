import http from "k6/http";
import { sleep } from "k6";
import { BASE_URL, STUDENT_LOGIN_IDENTIFIER, STUDENT_LOGIN_PASSWORD, thresholds } from "./config.js";
import { commonSummary, recordResponse } from "./helpers.js";
import { resolveLoad } from "./profiles.js";

const { vus, duration } = resolveLoad(100, "1m");

export const options = {
    vus,
    duration,
    thresholds,
};

export default function () {
    if (STUDENT_LOGIN_IDENTIFIER && STUDENT_LOGIN_PASSWORD) {
        const loginRes = http.post(
            `${BASE_URL}/api/v1/student-auth/login`,
            JSON.stringify({ identifier: STUDENT_LOGIN_IDENTIFIER, password: STUDENT_LOGIN_PASSWORD }),
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        recordResponse(loginRes, "student_login_api");
    }

    const loginPage = http.get(`${BASE_URL}/student-login`);
    recordResponse(loginPage, "student_login_page");

    const dashboardPage = http.get(`${BASE_URL}/student`);
    recordResponse(dashboardPage, "student_dashboard_page");

    const announcementsPage = http.get(`${BASE_URL}/student/announcements`);
    recordResponse(announcementsPage, "student_announcements_page");

    sleep(1);
}

export const handleSummary = commonSummary("student-portal");
