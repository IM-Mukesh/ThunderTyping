// next-sitemap.config.js (place in project root)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thundertyping.com";

module.exports = {
  siteUrl: SITE_URL,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 7000,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
