"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { BlogRatioResponse } from "@/types/blog-ratio";
import { formatTopicName } from "@/lib/topic-extraction";

interface SiteTreeChartProps {
  results: BlogRatioResponse;
}

interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
  collapsed?: boolean;
  itemStyle?: {
    color?: string;
  };
}

// Color palette matching the existing design
const COLORS = {
  root: "#1e3a5f",
  blog: "#2563eb",
  folders: [
    "#64748b", // slate
    "#d97706", // amber
    "#0d9488", // teal
    "#f43f5e", // rose
    "#6366f1", // indigo
    "#f97316", // orange
    "#0891b2", // cyan
    "#ec4899", // pink
  ],
  topics: "#94a3b8", // lighter for leaf nodes
};

export function SiteTreeChart({ results }: SiteTreeChartProps) {
  const treeData = useMemo(() => {
    const children: TreeNode[] = [];
    let nodeIndex = 0;

    // Add blog section with topics (counts as first node if present)
    if (results.blogUrls > 0) {
      const blogNode: TreeNode = {
        name: `Blog (${results.blogUrls})`,
        value: results.blogUrls,
        itemStyle: { color: COLORS.blog },
        collapsed: nodeIndex >= 2, // Collapse if not in first 2
        children: results.blogTopics.map((topic) => ({
          name: `${formatTopicName(topic.name)} (${topic.count})`,
          value: topic.count,
          itemStyle: { color: COLORS.topics },
        })),
      };
      children.push(blogNode);
      nodeIndex++;
    }

    // Add website folders with topics
    results.websiteFolders.forEach((folder, index) => {
      const folderNode: TreeNode = {
        name: `${folder.folder} (${folder.count})`,
        value: folder.count,
        itemStyle: { color: COLORS.folders[index % COLORS.folders.length] },
        collapsed: nodeIndex >= 2, // Collapse if not in first 2
        children: folder.topics.map((topic) => ({
          name: `${formatTopicName(topic.name)} (${topic.count})`,
          value: topic.count,
          itemStyle: { color: COLORS.topics },
        })),
      };
      children.push(folderNode);
      nodeIndex++;
    });

    const root: TreeNode = {
      name: results.domain,
      value: results.totalUrls,
      itemStyle: { color: COLORS.root },
      children,
    };

    return root;
  }, [results]);

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        formatter: (params: { name: string; value?: number }) => {
          const name = params.name.replace(/ \(\d+\)$/, "");
          const value = params.value || 0;
          return `<strong>${name}</strong><br/>Pages: ${value}`;
        },
      },
      series: [
        {
          type: "tree",
          data: [treeData],
          layout: "orthogonal",
          orient: "LR", // Left to Right (horizontal)
          top: "5%",
          bottom: "5%",
          left: "10%",
          right: "20%",
          symbol: "circle",
          symbolSize: (value: number, params: { data: { children?: unknown[] } }) => {
            // Larger nodes for sections, smaller for topics
            const hasChildren = params.data.children && params.data.children.length > 0;
            if (hasChildren) {
              return Math.max(20, Math.min(50, 15 + Math.sqrt(value || 1) * 3));
            }
            return Math.max(12, Math.min(30, 10 + Math.sqrt(value || 1) * 2));
          },
          label: {
            show: true,
            position: "right",
            rotate: 0,
            verticalAlign: "middle",
            align: "left",
            fontSize: 11,
            color: "#374151",
            formatter: (params: { name: string }) => {
              // Truncate long names
              const name = params.name;
              if (name.length > 20) {
                return name.slice(0, 18) + "…";
              }
              return name;
            },
          },
          leaves: {
            label: {
              position: "right",
              rotate: 0,
              verticalAlign: "middle",
              align: "left",
              fontSize: 10,
              color: "#6b7280",
            },
          },
          emphasis: {
            focus: "descendant",
            itemStyle: {
              borderColor: "#000",
              borderWidth: 2,
            },
          },
          expandAndCollapse: true,
          initialTreeDepth: -1, // Use collapsed property on individual nodes
          animationDuration: 550,
          animationDurationUpdate: 750,
          lineStyle: {
            color: "#d1d5db",
            width: 1.5,
            curveness: 0.5,
          },
        },
      ],
    }),
    [treeData]
  );

  // Calculate height based on number of folders (for horizontal layout, height grows with branches)
  const folderCount = (results.blogUrls > 0 ? 1 : 0) + results.websiteFolders.length;
  const chartHeight = Math.max(400, folderCount * 80);

  return (
    <div className="bg-background border-2 border-border rounded-2xl p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Content Topics Tree</h3>
        <p className="text-muted-foreground text-sm">
          Hierarchical view of {results.domain} • Click nodes to expand/collapse
          topic clusters
        </p>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <ReactECharts
          option={option}
          style={{ height: chartHeight, width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        Topics are extracted from URL patterns • Node size reflects page count
      </div>
    </div>
  );
}

