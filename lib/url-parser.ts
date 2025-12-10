/**
 * Extract semantic keywords from URLs for topic clustering
 */

// Structural keywords that don't indicate content topics
const STRUCTURAL_KEYWORDS = [
  // Content sections
  'blog', 'blogs', 'articles', 'article', 'post', 'posts',
  'news', 'resources', 'resource', 'guides', 'guide',
  'tutorials', 'tutorial', 'docs', 'documentation',
  'learn', 'academy', 'education', 'training',
  'help', 'support', 'faq', 'faqs',

  // Site structure
  'page', 'pages', 'content', 'category', 'categories',
  'tag', 'tags', 'author', 'authors',

  // Actions/features
  'webinar', 'webinars', 'event', 'events',
  'case-study', 'case-studies', 'ebook', 'ebooks',
  'whitepaper', 'whitepapers', 'newsletter',

  // Common dates/numbers
  '2024', '2025', '2023', '2022', '2021', '2020', '2019', '2018',

  // Generic terms
  'home', 'index', 'main', 'default', 'www',

  // Common stop words
  'the', 'and', 'for', 'with', 'how', 'what', 'why', 'when', 'where',
  'can', 'you', 'your', 'our', 'all', 'new', 'get', 'use', 'make',
];

/**
 * Find keywords that appear in a high percentage of URLs (likely structural)
 */
function findCommonKeywords(urls: string[], threshold: number = 0.3): Set<string> {
  const keywordCounts = new Map<string, number>();
  const totalUrls = urls.length;

  // Count keyword occurrences across all URLs
  urls.forEach(url => {
    const path = new URL(url, 'https://example.com').pathname;
    const keywords = path
      .split(/[\/\-_]/)
      .filter(k => k.length > 2)
      .map(k => k.toLowerCase());

    // Use Set to count each keyword only once per URL
    const uniqueKeywords = new Set(keywords);
    uniqueKeywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });
  });

  // Find keywords that appear in > threshold% of URLs
  const commonKeywords = new Set<string>();
  keywordCounts.forEach((count, keyword) => {
    if (count / totalUrls > threshold) {
      commonKeywords.add(keyword);
    }
  });

  console.log(`[URL PARSER] Found ${commonKeywords.size} common structural keywords:`, Array.from(commonKeywords));

  return commonKeywords;
}

/**
 * Extract semantic keywords from a single URL
 */
function extractKeywordsFromUrl(url: string, commonKeywords: Set<string>): string[] {
  try {
    // Parse URL to get pathname
    const urlObj = new URL(url, 'https://example.com');
    const path = urlObj.pathname;

    // Split by / to get segments
    const segments = path.split('/').filter(s => s.length > 0);

    // Skip first segment if it looks structural (common practice: /blog/, /resources/)
    // Keep it if it's the only segment (homepage-like paths)
    const relevantSegments = segments.length > 1 ? segments.slice(1) : segments;

    // Split segments by - and _ to get individual words
    const keywords = relevantSegments
      .flatMap(seg => seg.split(/[-_]/))
      .map(kw => kw.toLowerCase())
      .filter(kw => {
        // Remove very short words
        if (kw.length <= 2) return false;

        // Remove numbers
        if (/^\d+$/.test(kw)) return false;

        // Remove predefined structural keywords
        if (STRUCTURAL_KEYWORDS.includes(kw)) return false;

        // Remove dynamically detected common keywords
        if (commonKeywords.has(kw)) return false;

        return true;
      });

    return keywords;
  } catch (error) {
    console.error(`[URL PARSER] Error parsing URL "${url}":`, error);
    return [];
  }
}

/**
 * Extract semantic keywords from all URLs
 * Returns an array of objects with URL and its keyword string
 */
export function extractKeywordsFromUrls(urls: string[]): Array<{
  url: string;
  keywords: string;
}> {
  console.log(`[URL PARSER] Extracting keywords from ${urls.length} URLs...`);

  // Step 1: Find common structural keywords across all URLs
  const commonKeywords = findCommonKeywords(urls, 0.3);

  // Step 2: Extract keywords from each URL
  const results = urls.map(url => {
    const keywords = extractKeywordsFromUrl(url, commonKeywords);
    const keywordString = keywords.join(' ');

    return {
      url,
      keywords: keywordString,
    };
  });

  // Filter out URLs with no keywords
  const filtered = results.filter(r => r.keywords.length > 0);

  console.log(`[URL PARSER] Extracted keywords from ${filtered.length}/${urls.length} URLs`);
  console.log(`[URL PARSER] Sample:`, filtered.slice(0, 3));

  return filtered;
}
