import ROUTES from "@/constants/routes";
import { DEMO_VIDEO_URL } from "@/constants/external-links";

export type NavItem = {
    labelKey: string;
    href: string;
};

export const PUBLIC_NAV_ITEMS: NavItem[] = [
    { labelKey: "features", href: ROUTES.FEATURES },
    { labelKey: "useCases", href: ROUTES.USE_CASES },
    { labelKey: "pricing", href: ROUTES.PRICING },
    { labelKey: "resources", href: ROUTES.RESOURCES },
    { labelKey: "demo", href: DEMO_VIDEO_URL },

];

export const FOOTER_GROUPS: Array<{ titleKey: string; links: NavItem[] }> = [
    {
        titleKey: "groupProduct",
        links: [
            { labelKey: "features", href: ROUTES.FEATURES },
            { labelKey: "tools", href: ROUTES.TOOLS },
            { labelKey: "pricing", href: ROUTES.PRICING },
            { labelKey: "resources", href: ROUTES.RESOURCES },
            { labelKey: "demo", href: DEMO_VIDEO_URL },

        ],
    },
    {
        titleKey: "groupUseCases",
        links: [
            { labelKey: "allUseCases", href: ROUTES.USE_CASES },
            { labelKey: "jeeNeetInstitutes", href: "/use-cases/jee-neet-coaching" },
            { labelKey: "tuitionClasses", href: "/use-cases/tuition-classes" },
            { labelKey: "computerTrainingCenters", href: "/use-cases/computer-training" },
            { labelKey: "skillInstitutes", href: "/use-cases/skill-centers" },
        ],
    },

    {
        titleKey: "groupCompany",
        links: [
            { labelKey: "about", href: ROUTES.ABOUT },
            { labelKey: "contact", href: ROUTES.CONTACT },
            { labelKey: "institutes", href: ROUTES.INSTITUTES },
        ],
    },
    {
        titleKey: "groupLegal",
        links: [
            { labelKey: "helpCenter", href: ROUTES.HELP },
            { labelKey: "security", href: ROUTES.SECURITY },
            { labelKey: "privacyPolicy", href: ROUTES.PRIVACY },
            { labelKey: "terms", href: ROUTES.TERMS },
        ],
    },
];
