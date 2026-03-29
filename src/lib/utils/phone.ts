const digitsOnly = (value: string): string => value.replace(/\D/g, "");

export const normalizePhone = (phone: string, defaultCountryCode = "91"): string => {
    const digits = digitsOnly(phone);

    if (!digits) return "";
    if (digits.startsWith(defaultCountryCode)) return digits;

    return `${defaultCountryCode}${digits}`;
};
