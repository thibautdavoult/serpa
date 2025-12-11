import { isNonEnglishUrl } from './language-codes';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev/v1';

interface FirecrawlMapResponse {
  success: boolean;
  links: string[];
}

/**
 * Discover all URLs on a website using Firecrawl's /map endpoint
 */
export async function mapWebsite(domain: string): Promise<string[]> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY is not configured');
  }

  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;

    console.log(`[FIRECRAWL MAP] Starting map for: ${url}`);
    const startTime = Date.now();

    const response = await fetch(`${FIRECRAWL_BASE_URL}/map`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url,
        includeSubdomains: false,
        limit: 5000,
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[FIRECRAWL MAP] Response received in ${elapsed}ms with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FIRECRAWL MAP] Error response:', response.status, errorText);
      throw new Error(`Firecrawl map returned ${response.status}: ${errorText}`);
    }

    const data: FirecrawlMapResponse = await response.json();
    console.log('[FIRECRAWL MAP] Response data:', JSON.stringify(data, null, 2));

    if (!data.success || !data.links) {
      console.error('[FIRECRAWL MAP] Failed - success:', data.success, 'links:', data.links);
      throw new Error('Firecrawl map failed or returned no links');
    }

    console.log(`[FIRECRAWL MAP] ✓ Success! Found ${data.links.length} URLs in ${elapsed}ms`);

    return data.links;
  } catch (error) {
    console.error(`[FIRECRAWL MAP] ✗ Error mapping website "${domain}":`, error);
    throw error;
  }
}

/**
 * Map blog-specific pages using search parameter
 * Includes subdomains to catch blog.* patterns
 */
export async function mapBlogPages(domain: string): Promise<string[]> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY is not configured');
  }

  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;

    console.log(`[FIRECRAWL MAP BLOG] Starting blog map for: ${url}`);
    const startTime = Date.now();

    const response = await fetch(`${FIRECRAWL_BASE_URL}/map`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url,
        search: 'blog',
        limit: 5000,
        includeSubdomains: true,
        sitemapOnly: true,
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[FIRECRAWL MAP BLOG] Response received in ${elapsed}ms with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FIRECRAWL MAP BLOG] Error response:', response.status, errorText);
      throw new Error(`Firecrawl map returned ${response.status}: ${errorText}`);
    }

    const data: FirecrawlMapResponse = await response.json();
    console.log('[FIRECRAWL MAP BLOG] Response data:', JSON.stringify(data, null, 2));

    if (!data.success || !data.links) {
      console.error('[FIRECRAWL MAP BLOG] Failed - success:', data.success, 'links:', data.links);
      throw new Error('Firecrawl map failed or returned no links');
    }

    console.log(`[FIRECRAWL MAP BLOG] ✓ Success! Found ${data.links.length} blog URLs in ${elapsed}ms`);

    return data.links;
  } catch (error) {
    console.error(`[FIRECRAWL MAP BLOG] ✗ Error mapping blog pages "${domain}":`, error);
    throw error;
  }
}

/**
 * Filter out junk URLs (pagination, tags, images, admin, etc.)
 */
export function filterUrls(urls: string[], mainDomain?: string): string[] {
  const junkPatterns = [
    /\/blog\//,
    /\/tag\//,
    /\/tags\//,
    /\/category\//,
    /\/author\//,
    /\/page\//,
    /\?page=/,
    /\/feed/,
    /\/rss/,
    /\.xml$/,
    /\.json$/,
    /\/wp-admin/,
    /\/wp-content/,
    /\/cart/,
    /\/checkout/,
    /\/login/,
    /\/search/,
    /\?s=/,
    /\?q=/,
    /\.pdf$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.png$/,
    /\.gif$/,
    /\.svg$/,
    /\.webp$/,
    /\/legal\//,
  ];

  return urls.filter(url => {
    // Check junk patterns
    if (junkPatterns.some(pattern => pattern.test(url))) {
      return false;
    }

    // Check for non-English language URLs
    if (isNonEnglishUrl(url)) {
      return false;
    }

    // If mainDomain is provided, filter out subdomains
    if (mainDomain) {
      const urlMatch = url.match(/^https?:\/\/([^\/]+)/);
      if (urlMatch) {
        const urlDomain = urlMatch[1];
        const isMainDomain = urlDomain === mainDomain || urlDomain === `www.${mainDomain}`;
        return isMainDomain;
      }
    }

    return true;
  });
}
