"use client";

import type { UrlWithKeywords } from "@/types/analysis";

interface OutliersPanelProps {
  outliers: UrlWithKeywords[];
  outlierCount: number;
}

export function OutliersPanel({ outliers, outlierCount }: OutliersPanelProps) {
  if (!outliers || outliers.length === 0) {
    return null;
  }

  return (
    <div className="bg-background border-2 border-border rounded-2xl p-8 shadow-xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Outlier Pages</h3>
        <p className="text-muted-foreground text-sm">
          {outlierCount} pages that don&apos;t fit into the main topics (sorted
          alphabetically)
        </p>
      </div>

      <details className="group">
        <summary className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="font-semibold text-foreground">
            View all {outliers.length} outlier pages
          </div>
          <div className="text-muted-foreground group-open:rotate-180 transition-transform">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </summary>
        <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
          {outliers.map((urlData, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-border bg-muted/20"
            >
              <a
                href={urlData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline truncate mb-1"
              >
                {urlData.url}
              </a>
              <div className="text-xs text-muted-foreground">
                Keywords: {urlData.keywords}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

