import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = process.env.APP_URL || "https://prometric.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/auth", changefreq: "monthly", priority: "0.5" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/blog/metodo-prometric", changefreq: "monthly", priority: "0.7" },
          { path: "/blog/como-aplicar-avaliacao-fisica-escola", changefreq: "monthly", priority: "0.7" },
          { path: "/blog/como-calcular-imc-escolar", changefreq: "monthly", priority: "0.7" },
          { path: "/blog/avaliacao-fisica-educacao-fisica-escolar", changefreq: "monthly", priority: "0.7" },
          { path: "/blog/beneficios-avaliacao-fisica-escolas", changefreq: "monthly", priority: "0.7" },
        ];

        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
