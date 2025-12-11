"use client";

import { useMemo, useState } from "react";
import type { BlogRatioResponse } from "@/types/blog-ratio";

interface FolderNode {
  name: string;
  path: string;
  pageCount: number;
}

interface SiteMindMapProps {
  results: BlogRatioResponse;
}

// Calculate node size based on page count
// Uses a power scale with exponent < 1 to spread out small values more
function calculateNodeSize(
  pageCount: number,
  maxPageCount: number,
  minSize: number = 40,
  maxSize: number = 140
): number {
  if (maxPageCount === 0) return minSize;
  if (pageCount === 0) return minSize;
  
  // Use cube root for more dramatic size differences
  // Then apply additional scaling to spread values more
  const normalizedValue = pageCount / maxPageCount;
  
  // Power of 0.3 creates more spread than sqrt (0.5)
  // This makes small sections noticeably smaller
  const scaledRatio = Math.pow(normalizedValue, 0.35);
  
  return minSize + scaledRatio * (maxSize - minSize);
}

// Get color for folders
function getFolderColor(index: number, isOther: boolean = false): string {
  if (isOther) {
    return "hsl(var(--muted-foreground))";
  }
  const colors = [
    "hsl(221, 83%, 53%)", // Blue
    "hsl(142, 71%, 45%)", // Green
    "hsl(262, 83%, 58%)", // Purple
    "hsl(24, 94%, 50%)", // Orange
    "hsl(346, 77%, 49%)", // Red/Pink
    "hsl(189, 94%, 43%)", // Cyan
    "hsl(47, 96%, 53%)", // Yellow
    "hsl(280, 65%, 60%)", // Violet
    "hsl(160, 60%, 45%)", // Teal
    "hsl(10, 78%, 54%)", // Coral
  ];
  return colors[index % colors.length];
}

// Calculate smart threshold for "Other" grouping
function calculateOtherThreshold(
  folders: { count: number }[],
  totalPages: number
): number {
  const counts = folders.map((f) => f.count).sort((a, b) => b - a);

  if (counts.length <= 6) {
    return 0;
  }

  const percentageThreshold = Math.max(1, Math.floor(totalPages * 0.02));
  const top6Threshold = counts.length >= 6 ? counts[5] : 0;
  const threshold = Math.min(
    Math.max(percentageThreshold, 2),
    Math.max(top6Threshold, 2)
  );

  const wouldBeGrouped = counts.filter((c) => c < threshold).length;

  if (counts.length - wouldBeGrouped < 3 && counts.length >= 3) {
    return counts[2] > 0 ? counts[2] : 1;
  }

  if (wouldBeGrouped <= 2) {
    return 0;
  }

  return threshold;
}

interface NodeProps {
  node: FolderNode;
  x: number;
  y: number;
  size: number;
  color: string;
  isHomepage?: boolean;
  isBlog?: boolean;
  isHovered: boolean;
  onHover: (node: FolderNode | null) => void;
}

function MapNode({
  node,
  x,
  y,
  size,
  color,
  isHomepage,
  isBlog,
  isHovered,
  onHover,
}: NodeProps) {
  const fontSize = isHomepage ? 14 : Math.max(10, Math.min(13, size / 6));
  const countFontSize = isHomepage ? 12 : Math.max(9, Math.min(11, size / 7));

  return (
    <g
      className="cursor-pointer transition-all duration-200"
      onMouseEnter={() => onHover(node)}
      onMouseLeave={() => onHover(null)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        filter: isHovered ? "brightness(1.1)" : "none",
      }}
    >
      <circle
        cx={0}
        cy={0}
        r={size / 2}
        fill={color}
        opacity={isHomepage ? 1 : 0.9}
        stroke={isHovered ? "white" : "transparent"}
        strokeWidth={isHovered ? 3 : 0}
        className="transition-all duration-200"
      />
      <text
        x={0}
        y={isBlog ? -8 : isHomepage ? -8 : -4}
        textAnchor="middle"
        fill="white"
        fontSize={fontSize}
        fontWeight={isHomepage || isBlog ? 700 : 600}
        className="pointer-events-none select-none"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
      >
        {node.name.length > 14 ? node.name.slice(0, 13) + "…" : node.name}
      </text>
      <text
        x={0}
        y={10}
        textAnchor="middle"
        fill="white"
        fontSize={countFontSize}
        opacity={0.9}
        className="pointer-events-none select-none"
      >
        {node.pageCount} {node.pageCount === 1 ? "page" : "pages"}
      </text>
    </g>
  );
}

export function SiteMindMap({ results }: SiteMindMapProps) {
  const [hoveredNode, setHoveredNode] = useState<FolderNode | null>(null);

  // Parse folders and create structure
  const { folders, blogNode, totalPages, maxPageCount } = useMemo(() => {
    const threshold = calculateOtherThreshold(
      results.websiteFolders,
      results.totalUrls
    );

    const mainFolders: FolderNode[] = [];
    let otherCount = 0;

    for (const folder of results.websiteFolders) {
      if (threshold > 0 && folder.count < threshold) {
        otherCount += folder.count;
      } else {
        mainFolders.push({
          name: folder.folder,
          path: folder.folder,
          pageCount: folder.count,
        });
      }
    }

    // Sort by page count
    mainFolders.sort((a, b) => b.pageCount - a.pageCount);

    // Add "Other" if needed
    if (otherCount > 0) {
      mainFolders.push({
        name: "Other",
        path: "/other",
        pageCount: otherCount,
      });
    }

    // Blog node
    const blog: FolderNode = {
      name: "Blog",
      path: "/blog",
      pageCount: results.blogUrls,
    };

    const total = results.totalUrls;
    const max = Math.max(
      results.blogUrls,
      ...mainFolders.map((f) => f.pageCount)
    );

    return { folders: mainFolders, blogNode: blog, totalPages: total, maxPageCount: max };
  }, [results]);

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 500;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Homepage node
  const homepageNode: FolderNode = {
    name: results.domain,
    path: "/",
    pageCount: results.totalUrls,
  };
  const homepageSize = 90;

  // All nodes to position (blog + folders)
  const allNodes = [blogNode, ...folders];

  // Calculate positions
  const nodePositions = useMemo(() => {
    const count = allNodes.length;
    if (count === 0) return [];

    const baseRadius = Math.min(svgWidth, svgHeight) / 2 - 80;
    const startAngle = -Math.PI / 2;

    return allNodes.map((node, idx) => {
      const angle = startAngle + (idx / count) * 2 * Math.PI;
      const size = calculateNodeSize(node.pageCount, maxPageCount, 50, 120);
      const isBlog = node.path === "/blog";
      const isOther = node.name === "Other";

      return {
        node,
        x: centerX + Math.cos(angle) * baseRadius,
        y: centerY + Math.sin(angle) * baseRadius,
        size,
        color: isBlog
          ? "hsl(217, 91%, 60%)"
          : getFolderColor(idx - 1, isOther),
        isBlog,
      };
    });
  }, [allNodes, maxPageCount, centerX, centerY, svgWidth, svgHeight]);

  if (results.totalUrls === 0) {
    return (
      <div className="p-6 bg-background border rounded-xl">
        <div className="text-center text-muted-foreground">
          No site structure data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background border rounded-xl">
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Site Structure Map</h3>
        <p className="text-sm text-muted-foreground">
          Visual overview of {results.domain} • {totalPages} pages across{" "}
          {folders.length + 1} sections
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
        >
          {/* Connection lines */}
          <g className="connections">
            {nodePositions.map(({ node, x, y, color }, idx) => (
              <line
                key={`line-${idx}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth={2}
                opacity={
                  hoveredNode
                    ? hoveredNode.path === node.path
                      ? 0.8
                      : 0.15
                    : 0.4
                }
                className="transition-opacity duration-200"
              />
            ))}
          </g>

          {/* Folder/Blog nodes */}
          <g className="nodes">
            {nodePositions.map(({ node, x, y, size, color, isBlog }, idx) => (
              <MapNode
                key={`node-${idx}`}
                node={node}
                x={x}
                y={y}
                size={size}
                color={color}
                isBlog={isBlog}
                isHovered={hoveredNode?.path === node.path}
                onHover={setHoveredNode}
              />
            ))}
          </g>

          {/* Homepage node (center) */}
          <MapNode
            node={homepageNode}
            x={centerX}
            y={centerY}
            size={homepageSize}
            color="hsl(222, 47%, 31%)"
            isHomepage
            isHovered={hoveredNode?.path === "/"}
            onHover={setHoveredNode}
          />
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && hoveredNode.path !== "/" && (
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
            <span className="font-semibold">{hoveredNode.name}</span>
            <span className="text-white/70 ml-2">
              {hoveredNode.pageCount} pages
              {totalPages > 0 && (
                <span className="ml-1">
                  ({Math.round((hoveredNode.pageCount / totalPages) * 100)}% of
                  site)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "hsl(217, 91%, 60%)" }}
          />
          <span>Blog ({results.blogUrls})</span>
        </div>
        {nodePositions
          .filter((n) => !n.isBlog)
          .slice(0, 7)
          .map(({ node, color }, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>
                {node.name} ({node.pageCount})
              </span>
            </div>
          ))}
        {folders.length > 7 && (
          <span className="text-sm text-muted-foreground">
            +{folders.length - 7} more
          </span>
        )}
      </div>
    </div>
  );
}



