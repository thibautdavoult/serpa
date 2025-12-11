"use client";

import type { AnalysisResponse } from "@/types/analysis";
import { SummaryStats } from "./summary-stats";
import { TopicCard } from "./topic-card";
import { OutliersPanel } from "./outliers-panel";
import { SiteMindMap } from "./site-mind-map";

interface AnalysisResultsProps {
  results: AnalysisResponse;
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  return (
    <div className="mt-12 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Website Analysis</h2>
        <p className="text-muted-foreground">
          Here&apos;s what we found about {results.domain}
        </p>
      </div>

      {/* Summary Stats */}
      <SummaryStats results={results} />

      {/* Site Structure Mind Map */}
      <SiteMindMap results={results} />

      {/* Main Topics */}
      {results.topics && results.topics.length > 0 && (
        <div className="bg-background border-2 border-border rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Main Topics & Benefits</h3>
            <p className="text-muted-foreground text-sm">
              Key areas and benefits identified on {results.domain}
            </p>
          </div>

          <div className="space-y-4">
            {results.topics.map((topic, idx) => (
              <TopicCard key={idx} topic={topic} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Outliers */}
      <OutliersPanel
        outliers={results.outliers}
        outlierCount={results.outlier_count}
      />

      {/* No topics fallback */}
      {(!results.topics || results.topics.length === 0) && (
        <div className="bg-background border-2 border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center text-muted-foreground">
            No topics found. Try another domain.
          </div>
        </div>
      )}
    </div>
  );
}

