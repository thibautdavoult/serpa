import { NextRequest, NextResponse } from 'next/server';
import { mapWebsite, mapBlogPages } from '@/lib/firecrawl-service';
import { filterNonEnglishUrls } from '@/lib/language-codes';
import { extractTopicsFromUrls } from '@/lib/topic-extraction';
import type { BlogRatioRequest, BlogRatioResponse, FolderGroup } from '@/types/blog-ratio';

/**
 * Patterns that indicate a URL is a blog/article page
 * Used to filter out blog pages from the general website map
 */
const BLOG_PATTERNS = [
  /\/blog\//i,
  /\/blog$/i,
  /\/posts?\//i,
  /\/articles?\//i,
  /\/news\//i,
  /\/stories\//i,
  /\/insights?\//i,
  /\/resources\/blog/i,
  /\/updates?\//i,
  /\/announcements?\//i,
  /^https?:\/\/blog\./i, // blog.* subdomain
  // Date-based URL patterns (common in blogs)
  /\/\d{4}\/\d{2}\/\d{2}\//,  // /2024/01/15/
  /\/\d{4}\/\d{2}\//,         // /2024/01/
];

/**
 * Check if a URL is a blog/article page
 */
function isBlogUrl(url: string): boolean {
  return BLOG_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Extract the first-level folder from a URL path
 * e.g., "https://example.com/products/item" -> "/products"
 * e.g., "https://example.com/about" -> "/about"
 * e.g., "https://example.com/" -> "/"
 */
function extractFolder(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length === 0) {
      return '/';
    }
    
    // Return the first path segment as the folder
    return `/${pathParts[0]}`;
  } catch {
    return '/';
  }
}

/**
 * Group URLs by their first-level folder (without topics - topics added separately)
 */
function groupUrlsByFolder(urls: string[]): Omit<FolderGroup, 'topics'>[] {
  const folderMap = new Map<string, string[]>();
  
  for (const url of urls) {
    const folder = extractFolder(url);
    const existing = folderMap.get(folder) || [];
    existing.push(url);
    folderMap.set(folder, existing);
  }
  
  // Convert to array and sort by count (descending)
  const groups = Array.from(folderMap.entries())
    .map(([folder, folderUrls]) => ({
      folder,
      urls: folderUrls.sort(),
      count: folderUrls.length,
    }))
    .sort((a, b) => b.count - a.count);
  
  return groups;
}

/**
 * Calculate the number of topics to extract based on folder size
 * More pages = more topics to capture the variety, capped at 10
 */
function calculateTopicCount(pageCount: number): number {
  if (pageCount <= 10) return 3;
  if (pageCount <= 25) return 5;
  if (pageCount <= 50) return 7;
  return 10; // Cap at 10
}

/**
 * Calculate minimum pages a topic should have to be shown
 * Scales with folder size to avoid cluttering with tiny topics
 */
function calculateMinTopicCount(pageCount: number): number {
  if (pageCount <= 20) return 2;
  if (pageCount <= 50) return 3;
  if (pageCount <= 100) return 4;
  return 5; // For large folders, topics need at least 5 pages
}

/**
 * Add AI-extracted topics to folder groups
 */
async function addTopicsToFolders(groups: Omit<FolderGroup, 'topics'>[]): Promise<FolderGroup[]> {
  console.log(`[BLOG-RATIO] Extracting topics for ${groups.length} folders...`);
  
  // Extract topics for all folders in parallel, with dynamic topic count and minimum
  const topicsPromises = groups.map(group => {
    const topicCount = calculateTopicCount(group.count);
    const minTopicCount = calculateMinTopicCount(group.count);
    return extractTopicsFromUrls(group.urls, topicCount, minTopicCount);
  });
  const allTopics = await Promise.all(topicsPromises);
  
  // Combine groups with their topics
  return groups.map((group, index) => ({
    ...group,
    topics: allTopics[index],
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body: BlogRatioRequest = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    console.log(`[BLOG-RATIO] Starting analysis for: ${domain}`);

    // Run both map calls in parallel
    const [blogMappedUrls, websiteMappedUrls] = await Promise.all([
      mapBlogPages(domain),
      mapWebsite(domain),
    ]);

    console.log(`[BLOG-RATIO] Blog map returned ${blogMappedUrls.length} URLs`);
    console.log(`[BLOG-RATIO] Website map returned ${websiteMappedUrls.length} URLs`);

    // Filter out non-English URLs from both sets
    const filteredBlogUrls = filterNonEnglishUrls(blogMappedUrls);
    const allWebsiteUrls = filterNonEnglishUrls(websiteMappedUrls);

    console.log(`[BLOG-RATIO] After filtering non-English - Blog: ${filteredBlogUrls.length}, Website: ${allWebsiteUrls.length}`);

    // Validate that blog URLs actually match blog patterns
    // Firecrawl's search may return URLs that mention "blog" in content but aren't actual blog posts
    const blogUrls = filteredBlogUrls.filter(url => isBlogUrl(url));
    console.log(`[BLOG-RATIO] Blog URLs after pattern validation: ${blogUrls.length} (filtered out ${filteredBlogUrls.length - blogUrls.length} non-matching URLs)`);

    // Filter out blog-like URLs from the website map to get pure website pages
    const websiteUrls = allWebsiteUrls.filter(url => !isBlogUrl(url));
    console.log(`[BLOG-RATIO] Website URLs after excluding blog patterns: ${websiteUrls.length}`);

    // Deduplicate blog URLs (in case some appear in both maps)
    const uniqueBlogUrls = [...new Set(blogUrls)];
    const uniqueWebsiteUrls = [...new Set(websiteUrls)];

    console.log(`[BLOG-RATIO] Unique Blog URLs: ${uniqueBlogUrls.length}`);
    console.log(`[BLOG-RATIO] Unique Website URLs: ${uniqueWebsiteUrls.length}`);

    // Group website URLs by folder (without topics first)
    const foldersWithoutTopics = groupUrlsByFolder(uniqueWebsiteUrls);
    console.log(`[BLOG-RATIO] Website folders: ${foldersWithoutTopics.length}`);

    // Extract topics using AI - run blog and folder topics in parallel
    console.log(`[BLOG-RATIO] Starting AI topic extraction...`);
    const blogTopicCount = calculateTopicCount(uniqueBlogUrls.length);
    const blogMinTopicCount = calculateMinTopicCount(uniqueBlogUrls.length);
    const [blogTopics, websiteFolders] = await Promise.all([
      extractTopicsFromUrls(uniqueBlogUrls, blogTopicCount, blogMinTopicCount),
      addTopicsToFolders(foldersWithoutTopics),
    ]);
    console.log(`[BLOG-RATIO] Blog topics: ${blogTopics.length} (requested ${blogTopicCount}, min ${blogMinTopicCount})`);

    // Calculate totals and percentages
    const totalUrls = uniqueBlogUrls.length + uniqueWebsiteUrls.length;
    const blogPercentage = totalUrls > 0 ? Math.round((uniqueBlogUrls.length / totalUrls) * 100) : 0;
    const websitePercentage = totalUrls > 0 ? Math.round((uniqueWebsiteUrls.length / totalUrls) * 100) : 0;

    const response: BlogRatioResponse = {
      domain,
      totalUrls,
      blogUrls: uniqueBlogUrls.length,
      websiteUrls: uniqueWebsiteUrls.length,
      blogPercentage,
      websitePercentage,
      blogUrlsList: uniqueBlogUrls.sort(),
      websiteUrlsList: uniqueWebsiteUrls.sort(),
      websiteFolders,
      blogTopics,
    };

    console.log(`[BLOG-RATIO] Analysis complete for ${domain}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[BLOG-RATIO] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}


