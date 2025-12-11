"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, FileText, Folder, ChevronDown, ChevronUp } from "lucide-react";
import type { BlogRatioResponse, BlogRatioProgress, FolderGroup } from "@/types/blog-ratio";
import { SiteMindMap } from "@/components/blog-ratio/site-mind-map";
import { SiteTreeChart } from "@/components/blog-ratio/site-tree-chart";

// Colorblind-friendly palette with good contrast
const FOLDER_COLORS = [
  { bg: "bg-slate-500", hover: "hover:bg-slate-400", text: "text-white", label: "slate" },
  { bg: "bg-amber-600", hover: "hover:bg-amber-500", text: "text-white", label: "amber" },
  { bg: "bg-teal-600", hover: "hover:bg-teal-500", text: "text-white", label: "teal" },
  { bg: "bg-rose-500", hover: "hover:bg-rose-400", text: "text-white", label: "rose" },
  { bg: "bg-indigo-500", hover: "hover:bg-indigo-400", text: "text-white", label: "indigo" },
  { bg: "bg-orange-500", hover: "hover:bg-orange-400", text: "text-white", label: "orange" },
  { bg: "bg-cyan-600", hover: "hover:bg-cyan-500", text: "text-white", label: "cyan" },
  { bg: "bg-pink-500", hover: "hover:bg-pink-400", text: "text-white", label: "pink" },
];

const BLOG_COLOR = { 
  bg: "bg-blue-600", 
  hover: "hover:bg-blue-500",
  text: "text-white", 
  border: "border-blue-600" 
};

// Tooltip component for bar segments
function BarSegment({
  label,
  count,
  percentage,
  displayPercentage,
  colorBg,
  colorHover,
  colorText,
  onClick,
  isFirst = false,
  isLast = false,
}: {
  label: string;
  count: number;
  percentage: number; // Actual percentage for width
  displayPercentage: number; // Rounded percentage for display
  colorBg: string;
  colorHover: string;
  colorText: string;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (percentage <= 0) return null;

  return (
    <div
      className={`${colorBg} ${colorHover} ${colorText} flex items-center justify-center text-xs font-medium transition-all cursor-pointer relative ${!isFirst ? "border-l border-white/20" : ""} ${isLast ? "flex-1" : ""}`}
      style={isLast ? { minWidth: `${percentage}%` } : { width: `${percentage}%` }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {displayPercentage >= 8 && (
        <span className="truncate px-1">{label}</span>
      )}
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
            <div className="font-semibold">{label}</div>
            <div className="text-background/80">{count} pages • {displayPercentage}%</div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}

function FolderItem({ 
  folder, 
  colorIndex,
  isOpen,
  onToggle,
  onMount,
}: { 
  folder: FolderGroup; 
  colorIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  onMount?: (el: HTMLDivElement | null) => void;
}) {
  const color = FOLDER_COLORS[colorIndex % FOLDER_COLORS.length];

  return (
    <div 
      ref={onMount}
      className={`border rounded-lg overflow-hidden transition-all ${isOpen ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-sm ${color.bg}`} />
          <Folder className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{folder.folder}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{folder.count} pages</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="border-t bg-muted/30 p-3 max-h-48 overflow-y-auto">
          {folder.urls
            .map(url => url.replace(/\s+/g, '').trim())
            .filter(url => url.length > 0)
            .map((cleanUrl, i) => (
              <a
                key={i}
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-muted-foreground hover:text-foreground truncate"
              >
                {cleanUrl}
              </a>
            ))}
        </div>
      )}
    </div>
  );
}

export default function BlogRatioPage() {
  const [domain, setDomain] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<BlogRatioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<BlogRatioProgress>({
    step: 0,
    percent: 0,
    message: "",
  });
  const [showBlogUrls, setShowBlogUrls] = useState(false);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);

  // Refs for scrolling
  const blogSectionRef = useRef<HTMLDivElement>(null);
  const folderRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to element when expanded
  useEffect(() => {
    if (showBlogUrls && blogSectionRef.current) {
      blogSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showBlogUrls]);

  useEffect(() => {
    if (expandedFolder) {
      const ref = folderRefs.current.get(expandedFolder);
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [expandedFolder]);

  const handleSubmit = async () => {
    if (!domain.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setProgress({ step: 0, percent: 0, message: "" });
    setShowBlogUrls(false);
    setExpandedFolder(null);

    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const elapsed = Date.now() - startTime;
        if (elapsed < 5000) {
          return {
            step: 1,
            percent: Math.min(50, (elapsed / 5000) * 50),
            message: "Mapping website URLs...",
          };
        } else if (elapsed < 8000) {
          return {
            step: 2,
            percent: 50 + ((elapsed - 5000) / 3000) * 40,
            message: "Classifying pages...",
          };
        } else {
          return {
            step: 2,
            percent: Math.min(99, 90 + ((elapsed - 8000) / 2000) * 9),
            message: "Finalizing...",
          };
        }
      });
    }, 100);

    try {
      const response = await fetch("/api/blog-ratio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setProgress({ step: 2, percent: 100, message: "Complete!" });

      setTimeout(() => {
        setResults(data);
        setShowBlogUrls(true); // Auto-expand blog list by default
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnalyzing && domain.trim()) {
      handleSubmit();
    }
  };

  const handleBlogClick = () => {
    setShowBlogUrls(true);
    setExpandedFolder(null);
  };

  const handleFolderClick = (folder: string) => {
    setExpandedFolder(folder);
    setShowBlogUrls(false);
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolder(expandedFolder === folder ? null : folder);
  };

  // Calculate folder percentages for the distribution bar
  const getFolderPercentages = () => {
    if (!results) return [];
    return results.websiteFolders.map((folder, index) => ({
      folder: folder.folder,
      count: folder.count,
      percentage: results.totalUrls > 0 
        ? (folder.count / results.totalUrls) * 100 
        : 0,
      displayPercentage: results.totalUrls > 0 
        ? Math.round((folder.count / results.totalUrls) * 100) 
        : 0,
      color: FOLDER_COLORS[index % FOLDER_COLORS.length],
    }));
  };

  // Get precise blog percentage
  const getBlogPercentage = () => {
    if (!results || results.totalUrls === 0) return 0;
    return (results.blogUrls / results.totalUrls) * 100;
  };

  // Set ref for folder
  const setFolderRef = (folder: string) => (el: HTMLDivElement | null) => {
    if (el) {
      folderRefs.current.set(folder, el);
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
            <Link href="/app">
              <Button variant="ghost" size="sm">
                Main App
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4 pt-8">
            <h1 className="text-4xl font-bold tracking-tight">
              Blog vs Website Ratio
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Discover how much of your website is blog content vs core pages
            </p>
          </div>

          {/* Input */}
          <div className="relative mb-8">
            <div className="relative bg-background border-2 border-border rounded-xl shadow-lg p-2">
              <div className="flex items-center gap-2">
                <Input
                  className="h-12 px-4 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAnalyzing}
                  placeholder="Enter your domain (e.g., stripe.com)"
                />
                <Button
                  size="lg"
                  className="h-12 px-6 rounded-lg font-semibold"
                  onClick={handleSubmit}
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
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress */}
          {isAnalyzing && (
            <div className="mb-8 p-6 bg-muted/50 rounded-xl border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{progress.message}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress.percent)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 bg-background border rounded-xl text-center">
                  <div className="text-3xl font-bold">{results.totalUrls}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total URLs</div>
                </div>
                <div className={`p-6 bg-blue-50 dark:bg-blue-950/30 border ${BLOG_COLOR.border} rounded-xl text-center`}>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {results.blogUrls}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Blog Pages</div>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-2">
                    {results.blogPercentage}%
                  </div>
                </div>
                <div className="p-6 bg-muted/50 border rounded-xl text-center">
                  <div className="text-3xl font-bold">{results.websiteUrls}</div>
                  <div className="text-sm text-muted-foreground mt-1">Website Pages</div>
                  <div className="text-lg font-semibold mt-2">
                    {results.websitePercentage}%
                  </div>
                </div>
              </div>

              {/* Content Distribution Bar */}
              <div className="p-6 bg-background border rounded-xl">
                <h3 className="font-semibold mb-2">Content Distribution</h3>
                <p className="text-sm text-muted-foreground mb-4">Click on a segment to view details</p>
                
                {/* Stacked Bar */}
                <div className="h-12 rounded-lg overflow-hidden flex bg-muted" role="img" aria-label="Content distribution bar chart">
                  {/* Blog segment */}
                  {(() => {
                    const folderPercentages = getFolderPercentages();
                    const hasNoFolders = folderPercentages.length === 0 || folderPercentages.every(f => f.percentage <= 0);
                    return (
                      <BarSegment
                        label="Blog"
                        count={results.blogUrls}
                        percentage={getBlogPercentage()}
                        displayPercentage={results.blogPercentage}
                        colorBg={BLOG_COLOR.bg}
                        colorHover={BLOG_COLOR.hover}
                        colorText={BLOG_COLOR.text}
                        onClick={handleBlogClick}
                        isFirst={true}
                        isLast={hasNoFolders}
                      />
                    );
                  })()}
                  
                  {/* Folder segments */}
                  {getFolderPercentages().map((item, index, arr) => (
                    <BarSegment
                      key={item.folder}
                      label={item.folder}
                      count={item.count}
                      percentage={item.percentage}
                      displayPercentage={item.displayPercentage}
                      colorBg={item.color.bg}
                      colorHover={item.color.hover}
                      colorText={item.color.text}
                      onClick={() => handleFolderClick(item.folder)}
                      isLast={index === arr.length - 1}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button 
                    onClick={handleBlogClick}
                    className={`flex items-center gap-2 text-sm px-2 py-1 rounded transition-colors hover:bg-muted ${showBlogUrls ? "bg-muted" : ""}`}
                  >
                    <span className={`w-3 h-3 rounded-sm ${BLOG_COLOR.bg}`} />
                    <span>Blog ({results.blogUrls})</span>
                  </button>
                  {getFolderPercentages().slice(0, 8).map((item) => (
                    <button 
                      key={item.folder} 
                      onClick={() => handleFolderClick(item.folder)}
                      className={`flex items-center gap-2 text-sm px-2 py-1 rounded transition-colors hover:bg-muted ${expandedFolder === item.folder ? "bg-muted" : ""}`}
                    >
                      <span className={`w-3 h-3 rounded-sm ${item.color.bg}`} />
                      <span>{item.folder} ({item.count})</span>
                    </button>
                  ))}
                  {results.websiteFolders.length > 8 && (
                    <span className="text-sm text-muted-foreground py-1">
                      +{results.websiteFolders.length - 8} more folders
                    </span>
                  )}
                </div>
              </div>

              {/* Site Structure Mind Map */}
              <SiteMindMap results={results} />

              {/* Site Topics Tree Chart */}
              <SiteTreeChart results={results} />

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Blog URLs */}
                <div 
                  ref={blogSectionRef}
                  className={`p-4 bg-background border rounded-xl transition-all ${showBlogUrls ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  <button
                    onClick={() => setShowBlogUrls(!showBlogUrls)}
                    className="w-full flex items-center justify-between font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-sm ${BLOG_COLOR.bg}`} />
                      <FileText className="h-4 w-4 text-blue-600" />
                      Blog URLs ({results.blogUrls})
                    </span>
                    {showBlogUrls ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {showBlogUrls && (
                    <div className="mt-4 max-h-[400px] overflow-y-auto">
                      {results.blogUrlsList
                        .map(url => url.replace(/\s+/g, '').trim())
                        .filter(url => url.length > 0)
                        .map((cleanUrl, i) => (
                          <a
                            key={i}
                            href={cleanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-muted-foreground hover:text-foreground truncate"
                          >
                            {cleanUrl}
                          </a>
                        ))}
                      {results.blogUrlsList.length === 0 && (
                        <p className="text-sm text-muted-foreground">No blog pages found</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Website Folders */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <Folder className="h-4 w-4" />
                    Website Folders ({results.websiteFolders.length})
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {results.websiteFolders.map((folder, index) => (
                      <FolderItem 
                        key={folder.folder} 
                        folder={folder} 
                        colorIndex={index}
                        isOpen={expandedFolder === folder.folder}
                        onToggle={() => toggleFolder(folder.folder)}
                        onMount={setFolderRef(folder.folder)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
