"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface DomainInputProps {
  domain: string;
  setDomain: (domain: string) => void;
  isAnalyzing: boolean;
  onSubmit: () => void;
}

export function DomainInput({
  domain,
  setDomain,
  isAnalyzing,
  onSubmit,
}: DomainInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnalyzing && domain.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Analysis</span>
        </div>

        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Unlock your website&apos;s potential
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enter your domain and discover actionable insights to grow your online
          presence
        </p>
      </div>

      {/* Prompt Box */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-2xl blur-xl opacity-50" />

        {/* Main input container */}
        <div className="relative bg-background border-2 border-border rounded-2xl shadow-2xl p-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                className="h-14 px-6 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnalyzing}
                placeholder=""
              />
              {!domain && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40 text-lg">
                  Enter your domain...
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="h-14 px-8 rounded-xl font-semibold shadow-lg"
              onClick={onSubmit}
              disabled={!domain.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Helper text */}
          <div className="px-6 pt-3 pb-2 text-xs text-muted-foreground">
            Enter without https:// or www. • Press Enter to analyze
          </div>
        </div>
      </div>

      {/* Examples */}
      {!isAnalyzing && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Try these examples:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["stripe.com", "notion.so", "linear.app"].map((example) => (
              <button
                key={example}
                onClick={() => setDomain(example)}
                className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-sm transition-colors"
                disabled={isAnalyzing}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

