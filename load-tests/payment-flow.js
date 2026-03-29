import http from "k6/http";
import { sleep } from "k6";
import {
    BASE_URL,
    DASHBOARD_SESSION_TOKEN,
    PAYMENT_CREATE_ENDPOINT,
    PAYMENT_VERIFY_ENDPOINT,
    thresholds,
} from "./config.js";
import { addAuthCookie, commonSummary, recordResponse } from "./helpers.js";
import { resolveLoad } from "./profiles.js";

const { vus, duration } = resolveLoad(10, "1m");

export const options = {
    vus,
    duration,
    thresholds,
};

export default function () {
    const params = addAuthCookie({ headers: { "Content-Type": "application/json" } }, DASHBOARD_SESSION_TOKEN);

    const createRes = http.post(
        `${BASE_URL}${PAYMENT_CREATE_ENDPOINT}`,
        JSON.stringify({ amount: 1000, currency: "INR", source: "load-test" }),
        params
    );
    recordResponse(createRes, "payment_create");

    const verifyRes = http.post(
        `${BASE_URL}${PAYMENT_VERIFY_ENDPOINT}`,
        JSON.stringify({
            razorpay_payment_id: "pay_test",
            razorpay_subscription_id: "sub_test",
            razorpay_signature: "sig_test",
        }),
        params
    );
    recordResponse(verifyRes, "payment_verify");

    sleep(1);
}

export const handleSummary = commonSummary("payment-flow");
