/**
 * Utility functions for parsing website URLs into a hierarchical folder structure
 * Used for the mind-map visualization
 */

export interface FolderNode {
  name: string;
  path: string;
  pageCount: number;
  children: FolderNode[];
}

export interface SiteStructure {
  domain: string;
  homepage: FolderNode;
  folders: FolderNode[];
  totalPages: number;
}

/**
 * Parse a URL and extract the first-level folder path
 */
function getFirstLevelPath(url: string, baseDomain: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Homepage
    if (pathname === '/' || pathname === '') {
      return '/';
    }
    
    // Get first segment of the path
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return '/';
    }
    
    return '/' + segments[0];
  } catch {
    return '/';
  }
}

/**
 * Get display name from folder path - keep raw path
 */
function getFolderDisplayName(path: string): string {
  if (path === '/') {
    return '/';
  }
  
  // Keep the raw folder path
  return path;
}

/**
 * Determine the threshold for "Other" grouping based on page distribution
 * Uses a dynamic approach that works for any kind of website
 */
function calculateOtherThreshold(folderCounts: Map<string, number>, totalPages: number): number {
  const counts = Array.from(folderCounts.values()).sort((a, b) => b - a);
  
  if (counts.length <= 5) {
    // If we have 5 or fewer folders, don't group any as "Other"
    return 0;
  }
  
  // Strategy: Keep folders that represent at least 2% of total pages
  // OR are in the top 7 folders by page count
  // OR have at least 3 pages
  const percentageThreshold = Math.max(1, Math.floor(totalPages * 0.02));
  
  // Find the count of the 7th largest folder
  const top7Threshold = counts.length >= 7 ? counts[6] : 0;
  
  // Use the minimum of these as our threshold
  // This ensures we show significant folders while grouping truly small ones
  const threshold = Math.min(
    Math.max(percentageThreshold, 2), // At least 2% or 2 pages
    Math.max(top7Threshold, 2)         // Or in top 7
  );
  
  // Count how many folders would be grouped
  const wouldBeGrouped = counts.filter(c => c < threshold).length;
  
  // If grouping would leave fewer than 3 folders visible, lower the threshold
  if (counts.length - wouldBeGrouped < 3 && counts.length >= 3) {
    // Ensure we show at least the top 3
    return counts[2] > 0 ? counts[2] : 1;
  }
  
  // If only 1-2 folders would be grouped, don't bother grouping
  if (wouldBeGrouped <= 2) {
    return 0;
  }
  
  return threshold;
}

/**
 * Parse all URLs into a site structure with first-level folders
 */
export function parseUrlsToSiteStructure(
  urls: { url: string }[],
  domain: string
): SiteStructure {
  // Count pages per first-level folder
  const folderCounts = new Map<string, number>();
  
  for (const { url } of urls) {
    const path = getFirstLevelPath(url, domain);
    folderCounts.set(path, (folderCounts.get(path) || 0) + 1);
  }
  
  const totalPages = urls.length;
  
  // Calculate dynamic threshold for "Other" grouping
  const threshold = calculateOtherThreshold(folderCounts, totalPages);
  
  // Separate into main folders and "other" folders
  const mainFolders: FolderNode[] = [];
  let otherCount = 0;
  const otherFolderNames: string[] = [];
  
  // Get homepage count separately
  const homepageCount = folderCounts.get('/') || 0;
  folderCounts.delete('/');
  
  // Process remaining folders
  for (const [path, count] of folderCounts.entries()) {
    if (threshold > 0 && count < threshold) {
      otherCount += count;
      otherFolderNames.push(getFolderDisplayName(path));
    } else {
      mainFolders.push({
        name: getFolderDisplayName(path),
        path,
        pageCount: count,
        children: [],
      });
    }
  }
  
  // Sort main folders by page count (descending)
  mainFolders.sort((a, b) => b.pageCount - a.pageCount);
  
  // Add "Other" folder if there are grouped folders
  if (otherCount > 0) {
    mainFolders.push({
      name: 'Other',
      path: '/other',
      pageCount: otherCount,
      children: [],
    });
  }
  
  return {
    domain,
    homepage: {
      name: 'Homepage',
      path: '/',
      pageCount: Math.max(1, homepageCount), // At least 1 for the homepage itself
      children: [],
    },
    folders: mainFolders,
    totalPages,
  };
}

/**
 * Calculate node size based on page count (for visualization)
 * Returns a size multiplier between minSize and maxSize
 * Uses power scale to create more dramatic size differences
 */
export function calculateNodeSize(
  pageCount: number,
  maxPageCount: number,
  minSize: number = 40,
  maxSize: number = 140
): number {
  if (maxPageCount === 0) return minSize;
  if (pageCount === 0) return minSize;
  
  // Normalize the value
  const normalizedValue = pageCount / maxPageCount;
  
  // Power of 0.35 creates more spread than sqrt (0.5)
  // This makes small sections noticeably smaller
  const scaledRatio = Math.pow(normalizedValue, 0.35);
  
  return minSize + scaledRatio * (maxSize - minSize);
}

/**
 * Get color based on folder index (for visualization)
 */
export function getFolderColor(index: number, isOther: boolean = false): string {
  if (isOther) {
    return 'hsl(var(--muted-foreground))';
  }
  
  const colors = [
    'hsl(221, 83%, 53%)',  // Blue
    'hsl(142, 71%, 45%)',  // Green
    'hsl(262, 83%, 58%)',  // Purple
    'hsl(24, 94%, 50%)',   // Orange
    'hsl(346, 77%, 49%)',  // Red/Pink
    'hsl(189, 94%, 43%)',  // Cyan
    'hsl(47, 96%, 53%)',   // Yellow
    'hsl(280, 65%, 60%)',  // Violet
    'hsl(160, 60%, 45%)',  // Teal
    'hsl(10, 78%, 54%)',   // Coral
  ];
  
  return colors[index % colors.length];
}



