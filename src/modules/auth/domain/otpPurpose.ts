export enum OtpPurpose {
    VERIFY_EMAIL = "VERIFY_EMAIL",
    MFA = "MFA",
    RESET_PASSWORD = "RESET_PASSWORD",
}

export const OTP_PURPOSE_VALUES = Object.values(OtpPurpose);
