import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/main", "/login", "/api", "/oauth2"],
      },
    ],
    sitemap: "https://golladrim.com/sitemap.xml",
  };
}
