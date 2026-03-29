export const HELP_SLUG_BY_ROUTE: Array<{ match: RegExp; slug: string }> = [
    { match: /^\/onboarding/, slug: "getting-started" },
    { match: /^\/leads/, slug: "add-enquiry" },
    { match: /^\/students/, slug: "convert-student" },
    { match: /^\/courses/, slug: "create-course" },
    { match: /^\/batches/, slug: "create-course" },
    { match: /^\/fees/, slug: "fees" },
    { match: /^\/billing/, slug: "billing" },
    { match: /^\/settings/, slug: "faq" },
];

export const getContextualHelpSlug = (pathname: string): string | undefined =>
    HELP_SLUG_BY_ROUTE.find((item) => item.match.test(pathname))?.slug;
