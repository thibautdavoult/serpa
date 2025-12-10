"use client";

import type { Topic } from "@/types/analysis";

interface TopicCardProps {
  topic: Topic;
  index: number;
}

export function TopicCard({ topic, index }: TopicCardProps) {
  return (
    <details className="group">
      <summary className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-foreground">{topic.name}</div>
              <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {topic.count || 0} pages
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {topic.description}
            </div>
          </div>
        </div>
        <div className="text-muted-foreground group-open:rotate-180 transition-transform ml-2">
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
      {topic.urls && topic.urls.length > 0 && (
        <div className="mt-2 ml-11 space-y-2 max-h-[400px] overflow-y-auto">
          {topic.urls.map((urlData, urlIdx) => (
            <div
              key={urlIdx}
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
      )}
    </details>
  );
}

