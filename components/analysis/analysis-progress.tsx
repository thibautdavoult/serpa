"use client";

import type { AnalysisProgress as AnalysisProgressType } from "@/types/analysis";

interface AnalysisProgressProps {
  progress: AnalysisProgressType;
}

export function AnalysisProgress({ progress }: AnalysisProgressProps) {
  return (
    <div className="mt-12 max-w-lg mx-auto">
      <div className="bg-background border-2 border-border rounded-2xl p-8 shadow-xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{progress.message}</div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress.percent)}% complete
            </div>
          </div>
        </div>

        {/* Step Description */}
        <div className="text-sm text-muted-foreground text-center">
          {progress.step === 1 &&
            "Scanning the website for all available pages..."}
          {progress.step === 2 && "Filtering and processing the content..."}
          {progress.step === 3 && "Extracting main topics from homepage..."}
          {progress.step === 4 && "Classifying all pages into topics..."}
        </div>
      </div>
    </div>
  );
}

