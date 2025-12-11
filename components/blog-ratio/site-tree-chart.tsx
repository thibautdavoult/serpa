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
  other: "#9ca3af", // gray for "Other" group
};

// Calculate smart threshold for "Other" grouping
function calculateOtherThreshold(
  folders: { count: number }[],
  totalPages: number
): number {
  const counts = folders.map((f) => f.count).sort((a, b) => b - a);

  // If 6 or fewer folders, show them all
  if (counts.length <= 6) {
    return 0;
  }

  // Use 2% of total as threshold (minimum 2 pages)
  const percentageThreshold = Math.max(2, Math.floor(totalPages * 0.02));
  
  // Or use the count of the 6th largest folder
  const top6Threshold = counts.length >= 6 ? counts[5] : 0;
  
  // Use the smaller of the two thresholds
  const threshold = Math.min(
    Math.max(percentageThreshold, 2),
    Math.max(top6Threshold, 2)
  );

  const wouldBeGrouped = counts.filter((c) => c < threshold).length;

  // Ensure we keep at least 3 main folders
  if (counts.length - wouldBeGrouped < 3 && counts.length >= 3) {
    return counts[2] > 0 ? counts[2] : 1;
  }

  // Only group if there are at least 3 small folders
  if (wouldBeGrouped <= 2) {
    return 0;
  }

  return threshold;
}

export function SiteTreeChart({ results }: SiteTreeChartProps) {
  const treeData = useMemo(() => {
    const children: TreeNode[] = [];

    // Add blog section with topics
    if (results.blogUrls > 0) {
      const blogNode: TreeNode = {
        name: `Blog (${results.blogUrls})`,
        value: results.blogUrls,
        itemStyle: { color: COLORS.blog },
        collapsed: false, // Expanded by default
        children: results.blogTopics.map((topic) => ({
          name: `${formatTopicName(topic.name)} (${topic.count})`,
          value: topic.count,
          itemStyle: { color: COLORS.topics },
        })),
      };
      children.push(blogNode);
    }

    // Calculate threshold for grouping small folders
    const threshold = calculateOtherThreshold(
      results.websiteFolders,
      results.totalUrls
    );

    // Separate main folders from "other" folders
    const mainFolders: typeof results.websiteFolders = [];
    const otherFolders: typeof results.websiteFolders = [];

    for (const folder of results.websiteFolders) {
      if (threshold > 0 && folder.count < threshold) {
        otherFolders.push(folder);
      } else {
        mainFolders.push(folder);
      }
    }

    // Sort main folders by count (descending)
    mainFolders.sort((a, b) => b.count - a.count);

    // Add main website folders with topics
    mainFolders.forEach((folder, index) => {
      const folderNode: TreeNode = {
        name: `${folder.folder} (${folder.count})`,
        value: folder.count,
        itemStyle: { color: COLORS.folders[index % COLORS.folders.length] },
        collapsed: false, // Expanded by default
        children: folder.topics.map((topic) => ({
          name: `${formatTopicName(topic.name)} (${topic.count})`,
          value: topic.count,
          itemStyle: { color: COLORS.topics },
        })),
      };
      children.push(folderNode);
    });

    // Add "Other" node if there are grouped folders
    if (otherFolders.length > 0) {
      const otherCount = otherFolders.reduce((sum, f) => sum + f.count, 0);
      const otherNode: TreeNode = {
        name: `Other (${otherCount})`,
        value: otherCount,
        itemStyle: { color: COLORS.other },
        collapsed: true, // Always start collapsed
        children: otherFolders.map((folder) => ({
          name: `${folder.folder} (${folder.count})`,
          value: folder.count,
          itemStyle: { color: COLORS.topics },
        })),
      };
      children.push(otherNode);
    }

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
          left: "8%",
          right: "30%",
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

  // Calculate height based on number of visible nodes (for horizontal layout, height grows with branches)
  const visibleNodeCount = useMemo(() => {
    const threshold = calculateOtherThreshold(results.websiteFolders, results.totalUrls);
    const mainFolderCount = results.websiteFolders.filter(f => threshold === 0 || f.count >= threshold).length;
    const hasOtherGroup = threshold > 0 && results.websiteFolders.some(f => f.count < threshold);
    const blogCount = results.blogUrls > 0 ? 1 : 0;
    return blogCount + mainFolderCount + (hasOtherGroup ? 1 : 0);
  }, [results]);
  const chartHeight = Math.max(400, visibleNodeCount * 80);

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

