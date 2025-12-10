"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DomainInput } from "@/components/analysis/domain-input";
import { AnalysisProgress } from "@/components/analysis/analysis-progress";
import { AnalysisResults } from "@/components/analysis/results";
import { FeaturesGrid } from "@/components/analysis/features-grid";
import type { AnalysisResponse, AnalysisProgress as ProgressType } from "@/types/analysis";

export default function AppPage() {
  const [domain, setDomain] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressType>({
    step: 0,
    percent: 0,
    message: "",
  });

  const handleSubmit = async () => {
    if (!domain.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setProgress({ step: 0, percent: 0, message: "" });

    console.log("[FRONTEND] Starting analysis for domain:", domain.trim());
    const startTime = Date.now();

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const elapsed = Date.now() - startTime;

        // Step 1: Discovering pages (0-8 seconds, 0-30%)
        if (elapsed < 8000) {
          return {
            step: 1,
            percent: Math.min(30, (elapsed / 8000) * 30),
            message: "Discovering pages...",
          };
        }
        // Step 2: Analyzing structure (8-10 seconds, 30-45%)
        else if (elapsed < 10000) {
          return {
            step: 2,
            percent: 30 + ((elapsed - 8000) / 2000) * 15,
            message: "Analyzing content structure...",
          };
        }
        // Step 3: Identifying topics (10-25 seconds, 45-70%)
        else if (elapsed < 25000) {
          return {
            step: 3,
            percent: 45 + ((elapsed - 10000) / 15000) * 25,
            message: "Identifying main topics...",
          };
        }
        // Step 4: Classifying pages (25-35 seconds, 70-95%)
        else if (elapsed < 35000) {
          return {
            step: 4,
            percent: 70 + ((elapsed - 25000) / 10000) * 25,
            message: "Classifying pages...",
          };
        }
        // Waiting for response (95-99%)
        else {
          return {
            step: 4,
            percent: Math.min(99, 95 + ((elapsed - 35000) / 5000) * 4),
            message: "Finalizing analysis...",
          };
        }
      });
    }, 100);

    try {
      console.log("[FRONTEND] Sending request to /api/analyze...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      clearInterval(progressInterval);

      const elapsed = Date.now() - startTime;
      console.log(
        `[FRONTEND] Response received in ${elapsed}ms with status: ${response.status}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[FRONTEND] Error response:", errorData);
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      console.log("[FRONTEND] Success! Analysis results:", data);
      console.log(`[FRONTEND] Total time: ${Math.round(elapsed / 1000)}s`);

      // Complete progress
      setProgress({ step: 4, percent: 100, message: "Complete!" });

      // Small delay to show completion before showing results
      setTimeout(() => {
        setResults(data);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error("[FRONTEND] Analysis failed:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            Serpa
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Account
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl mx-auto">
          {/* Domain Input */}
          <DomainInput
            domain={domain}
            setDomain={setDomain}
            isAnalyzing={isAnalyzing}
            onSubmit={handleSubmit}
          />

          {/* Progress Indicator */}
          {isAnalyzing && <AnalysisProgress progress={progress} />}

          {/* Error Message */}
          {error && (
            <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && <AnalysisResults results={results} />}

          {/* Features grid (shown when no results) */}
          {!results && !isAnalyzing && <FeaturesGrid />}
        </div>
      </main>
    </div>
  );
}
