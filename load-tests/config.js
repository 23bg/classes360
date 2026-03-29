export const BASE_URL = __ENV.BASE_URL || "https://classes360.online";
export const PUBLIC_INSTITUTE_SLUG = __ENV.PUBLIC_INSTITUTE_SLUG || "kiran-academy";
export const TEST_PHONE = __ENV.TEST_PHONE || "9999999999";
export const TEST_STUDENT_NAME = __ENV.TEST_STUDENT_NAME || "Test Student";
export const TEST_COURSE_NAME = __ENV.TEST_COURSE_NAME || "Java Fullstack";

export const DASHBOARD_SESSION_TOKEN = __ENV.DASHBOARD_SESSION_TOKEN || "";
export const STUDENT_LOGIN_IDENTIFIER = __ENV.STUDENT_LOGIN_IDENTIFIER || "";
export const STUDENT_LOGIN_PASSWORD = __ENV.STUDENT_LOGIN_PASSWORD || "";

export const PAYMENT_CREATE_ENDPOINT = __ENV.PAYMENT_CREATE_ENDPOINT || "/api/v1/payment/create";
export const PAYMENT_VERIFY_ENDPOINT = __ENV.PAYMENT_VERIFY_ENDPOINT || "/api/v1/payment/verify";

export const LOAD_PROFILE = (__ENV.LOAD_PROFILE || "scenario").toLowerCase();

export const thresholds = {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
};

export const loadLevels = {
    light: {
        vus: 50,
        duration: "30s",
    },
    medium: {
        vus: 200,
        duration: "1m",
    },
    heavy: {
        vus: 500,
        duration: "2m",
    },
};
