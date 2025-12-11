"use client";

import { useMemo, useState } from "react";
import type { AnalysisResponse } from "@/types/analysis";
import {
  parseUrlsToSiteStructure,
  calculateNodeSize,
  getFolderColor,
  type FolderNode,
} from "@/lib/site-structure";

interface SiteMindMapProps {
  results: AnalysisResponse;
}

interface NodeProps {
  node: FolderNode;
  x: number;
  y: number;
  size: number;
  color: string;
  isHomepage?: boolean;
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
      {/* Node circle */}
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

      {/* Folder name */}
      <text
        x={0}
        y={isHomepage ? -8 : -4}
        textAnchor="middle"
        fill="white"
        fontSize={fontSize}
        fontWeight={isHomepage ? 700 : 600}
        className="pointer-events-none select-none"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
      >
        {node.name.length > 14 ? node.name.slice(0, 13) + "…" : node.name}
      </text>

      {/* Page count */}
      <text
        x={0}
        y={isHomepage ? 10 : 10}
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

  // Gather all URLs from topics and outliers
  const allUrls = useMemo(() => {
    const urls: { url: string }[] = [];

    if (results.topics) {
      for (const topic of results.topics) {
        if (topic.urls) {
          urls.push(...topic.urls);
        }
      }
    }

    if (results.outliers) {
      urls.push(...results.outliers);
    }

    return urls;
  }, [results]);

  // Parse URLs into site structure
  const siteStructure = useMemo(() => {
    return parseUrlsToSiteStructure(allUrls, results.domain);
  }, [allUrls, results.domain]);

  // Calculate visualization dimensions
  const svgWidth = 700;
  const svgHeight = 500;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Find max page count for sizing
  const maxPageCount = Math.max(
    siteStructure.homepage.pageCount,
    ...siteStructure.folders.map((f) => f.pageCount)
  );

  // Calculate homepage size
  const homepageSize = calculateNodeSize(
    siteStructure.homepage.pageCount,
    maxPageCount,
    80,
    100
  );

  // Calculate positions for folder nodes in a radial layout
  const folderPositions = useMemo(() => {
    const folders = siteStructure.folders;
    const count = folders.length;

    if (count === 0) return [];

    // Determine radius based on number of folders
    const baseRadius = Math.min(svgWidth, svgHeight) / 2 - 80;

    // Calculate sizes first to determine proper spacing
    const sizes = folders.map((f) =>
      calculateNodeSize(f.pageCount, maxPageCount, 50, 120)
    );

    // Distribute nodes around the circle
    // Start from top (-90 degrees) and go clockwise
    const startAngle = -Math.PI / 2;

    return folders.map((folder, idx) => {
      const angle = startAngle + (idx / count) * 2 * Math.PI;
      const size = sizes[idx];

      // Adjust radius based on node size to prevent overlap
      const adjustedRadius = baseRadius;

      return {
        folder,
        x: centerX + Math.cos(angle) * adjustedRadius,
        y: centerY + Math.sin(angle) * adjustedRadius,
        size,
        angle,
        color: getFolderColor(idx, folder.name === "Other"),
      };
    });
  }, [siteStructure.folders, maxPageCount, centerX, centerY, svgWidth, svgHeight]);

  // If no folders, show a message
  if (siteStructure.folders.length === 0 && allUrls.length === 0) {
    return (
      <div className="bg-background border-2 border-border rounded-2xl p-8 shadow-xl">
        <div className="text-center text-muted-foreground">
          No site structure data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border-2 border-border rounded-2xl p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Site Structure</h3>
        <p className="text-muted-foreground text-sm">
          Mind map visualization of {results.domain} • {siteStructure.totalPages}{" "}
          pages across {siteStructure.folders.length + 1} sections
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
        >
          {/* Connection lines from homepage to folders */}
          <g className="connections">
            {folderPositions.map(({ folder, x, y, color }, idx) => (
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
                    ? hoveredNode.path === folder.path
                      ? 0.8
                      : 0.15
                    : 0.4
                }
                className="transition-opacity duration-200"
              />
            ))}
          </g>

          {/* Folder nodes */}
          <g className="folder-nodes">
            {folderPositions.map(({ folder, x, y, size, color }, idx) => (
              <MapNode
                key={`folder-${idx}`}
                node={folder}
                x={x}
                y={y}
                size={size}
                color={color}
                isHovered={hoveredNode?.path === folder.path}
                onHover={setHoveredNode}
              />
            ))}
          </g>

          {/* Homepage node (rendered last to be on top) */}
          <MapNode
            node={siteStructure.homepage}
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
              {hoveredNode.pageCount > 0 && siteStructure.totalPages > 0 && (
                <span className="ml-1">
                  (
                  {Math.round(
                    (hoveredNode.pageCount / siteStructure.totalPages) * 100
                  )}
                  % of site)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {folderPositions.slice(0, 8).map(({ folder, color }, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>
              {folder.name} ({folder.pageCount})
            </span>
          </div>
        ))}
        {folderPositions.length > 8 && (
          <span className="text-sm text-muted-foreground">
            +{folderPositions.length - 8} more
          </span>
        )}
      </div>
    </div>
  );
}



