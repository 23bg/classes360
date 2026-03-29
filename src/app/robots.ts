import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://classes360.online";


export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/login",
                    "/signup",
                    "/overview",
                    "/onboarding",
                    "/verification",

                    // dashboards / private areas
                    "/student",
                    "/i/*/student",

                    // APIs
                    "/api/",
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}

// export default function robots(): MetadataRoute.Robots {
//     return {
//         rules: [
//             {
//                 userAgent: "*",
//                 allow: ["/", "/i/"],
//                 disallow: [
//                     "/login",
//                     "/signup",
//                     "/overview",
//                     "/student",
//                     "/onboarding",
//                     "/verification",
//                     "/api",
//                 ],
//             },
//         ],
//         sitemap: `${BASE_URL}/sitemap.xml`,
//     };
// }