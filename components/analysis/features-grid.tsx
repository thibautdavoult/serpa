"use client";

import { Sparkles } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      title: "Instant Insights",
      description: "Get actionable recommendations in seconds",
    },
    {
      title: "AI-Powered",
      description: "Advanced analysis using cutting-edge technology",
    },
    {
      title: "Actionable",
      description: "Clear steps to improve your online presence",
    },
  ];

  return (
    <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="p-6 rounded-xl border border-border bg-background/50"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

