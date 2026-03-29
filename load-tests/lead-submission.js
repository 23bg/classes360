import http from "k6/http";
import { sleep } from "k6";
import {
    BASE_URL,
    PUBLIC_INSTITUTE_SLUG,
    TEST_COURSE_NAME,
    TEST_PHONE,
    TEST_STUDENT_NAME,
    thresholds,
} from "./config.js";
import { commonSummary, recordResponse } from "./helpers.js";
import { resolveLoad } from "./profiles.js";

const { vus, duration } = resolveLoad(50, "1m");

export const options = {
    vus,
    duration,
    thresholds,
};

export default function () {
    const uniquePhone = `${TEST_PHONE.slice(0, 6)}${String(__VU).padStart(2, "0")}${String(__ITER % 100).padStart(2, "0")}`;

    const payload = JSON.stringify({
        name: `${TEST_STUDENT_NAME} ${__VU}-${__ITER}`,
        phone: uniquePhone,
        course: TEST_COURSE_NAME,
    });

    const res = http.post(`${BASE_URL}/api/v1/public/${PUBLIC_INSTITUTE_SLUG}/lead`, payload, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    recordResponse(res, "lead_submission");
    sleep(1);
}

export const handleSummary = commonSummary("lead-submission");
