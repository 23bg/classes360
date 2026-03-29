import http from "k6/http";
import { sleep } from "k6";
import { BASE_URL, PUBLIC_INSTITUTE_SLUG, thresholds } from "./config.js";
import { commonSummary, recordResponse } from "./helpers.js";
import { resolveLoad } from "./profiles.js";

const { vus, duration } = resolveLoad(100, "1m");

export const options = {
    vus,
    duration,
    thresholds,
};

export default function () {
    const homeRes = http.get(`${BASE_URL}/i/${PUBLIC_INSTITUTE_SLUG}`);
    recordResponse(homeRes, "public_home");

    const coursesRes = http.get(`${BASE_URL}/i/${PUBLIC_INSTITUTE_SLUG}/courses`);
    recordResponse(coursesRes, "public_courses");

    sleep(1);
}

export const handleSummary = commonSummary("public-pages");
