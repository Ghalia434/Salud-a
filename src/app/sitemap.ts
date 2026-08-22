import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";

const BASE_URL = "https://saludea.ma";
const APP_DIR = path.join(process.cwd(), "src", "app");

// Route subtrees that are never public — admin pages aren't meant to be
// indexed at all, so we prune the whole folder before descending into it.
const EXCLUDED_TOP_SEGMENTS = new Set(["admin"]);

// Every /commander/* step except the entry point requires cart state that
// only exists in a real client session (localStorage) — a crawler with no
// session just gets redirected back to /commander/objectif, so those steps
// aren't meaningful standalone URLs to index.
const COMMANDER_ALLOWED_SUBROUTES = new Set(["objectif"]);

interface DiscoveredRoute {
  route: string;
  filePath: string;
}

// Walks src/app looking for page.tsx/page.ts files and turns each into a
// public URL path, so any new marketing page added under src/app (outside
// /admin and the /commander/* funnel steps) shows up here automatically —
// no manual edits needed when new pages are added.
function collectRoutes(dir: string, segments: string[] = []): DiscoveredRoute[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routes: DiscoveredRoute[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      // Dynamic segments (e.g. [id]) need real data we don't have here —
      // skip the whole subtree rather than guess.
      if (entry.name.startsWith("[")) continue;

      // Route groups (e.g. (protected)) don't add a URL segment.
      const isGroup = entry.name.startsWith("(");
      if (!isGroup && segments.length === 0 && EXCLUDED_TOP_SEGMENTS.has(entry.name)) {
        continue;
      }

      const nextSegments = isGroup ? segments : [...segments, entry.name];
      routes.push(...collectRoutes(path.join(dir, entry.name), nextSegments));
      continue;
    }

    if (entry.name === "page.tsx" || entry.name === "page.ts") {
      const [topSegment, subSegment] = segments;
      if (topSegment === "commander" && !COMMANDER_ALLOWED_SUBROUTES.has(subSegment ?? "")) {
        continue;
      }
      routes.push({
        route: segments.length ? `/${segments.join("/")}` : "/",
        filePath: path.join(dir, entry.name),
      });
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = collectRoutes(APP_DIR);

  return routes
    .sort((a, b) => a.route.localeCompare(b.route))
    .map(({ route, filePath }) => ({
      url: `${BASE_URL}${route}`,
      lastModified: fs.statSync(filePath).mtime,
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? 1 : 0.8,
    }));
}
