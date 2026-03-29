import type { Metadata } from "next";
import { getInstituteAddress, type InstitutePublicData } from "@/app/i/[slug]/_lib/public-institute";

type BuildMetadataOptions = {
    institute: InstitutePublicData;
    titleSuffix?: string;
    description?: string;
};

export function buildInstituteMetadata({ institute, titleSuffix, description }: BuildMetadataOptions): Metadata {
    const instituteName = institute.name?.trim() || "Institute";
    const city = institute.address?.city?.trim() || "your city";
    const fullTitle = titleSuffix ? `${instituteName} | ${titleSuffix}` : `${instituteName} | Coaching Institute in ${city}`;
    const defaultDescription = `${instituteName} in ${city}. ${getInstituteAddress(institute) || "Admissions open"}.`;
    const logo = (institute.logo || "").trim();

    return {
        title: fullTitle,
        description: description || defaultDescription,
        ...(logo
            ? {
                icons: {
                    icon: [{ url: logo }],
                    shortcut: [{ url: logo }],
                    apple: [{ url: logo }],
                },
            }
            : {}),
    };
}
