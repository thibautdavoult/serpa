"use client";

import type { AnalysisResponse } from "@/types/analysis";

interface SummaryStatsProps {
  results: AnalysisResponse;
}

export function SummaryStats({ results }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-background border-2 border-border rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-primary">
          {results.total_urls || 0}
        </div>
        <div className="text-sm text-muted-foreground mt-1">Total URLs Found</div>
      </div>
      <div className="bg-background border-2 border-border rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-green-600">
          {results.topics?.length || 0}
        </div>
        <div className="text-sm text-muted-foreground mt-1">Main Topics</div>
      </div>
      <div className="bg-background border-2 border-border rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-blue-600">
          {results.urls_with_keywords || 0}
        </div>
        <div className="text-sm text-muted-foreground mt-1">URLs Analyzed</div>
      </div>
      <div className="bg-background border-2 border-border rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-orange-600">
          {results.outlier_count || 0}
        </div>
        <div className="text-sm text-muted-foreground mt-1">Outlier Pages</div>
      </div>
    </div>
  );
}

