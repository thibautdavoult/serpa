/**
 * Utility functions for extracting topics from URL slugs using AI
 * Used for the tree chart visualization
 */

export interface TopicCount {
  name: string;
  count: number;
}

/**
 * Extract the slug portion from a URL (everything after the first path segment)
 * e.g., "/blog/virtual-backgrounds-guide" -> "virtual-backgrounds-guide"
 */
function extractSlugFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Split path into segments
    const segments = pathname.split('/').filter(Boolean);
    
    // Skip the first segment (the folder) - it's already visible in the tree
    const slugSegments = segments.slice(1);
    
    if (slugSegments.length === 0) {
      return null;
    }
    
    // Join remaining segments and clean up
    return slugSegments
      .join('/')
      .replace(/\.[a-z]+$/, '') // Remove file extensions
      .replace(/[-_]/g, ' ')    // Replace separators with spaces
      .toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Extract top N topics from a list of URLs using OpenAI
 * Falls back to empty array if API call fails
 * @param urls - List of URLs to analyze
 * @param topN - Maximum number of topics to return
 * @param minCount - Minimum pages a topic must have to be included
 */
export async function extractTopicsFromUrls(urls: string[], topN: number = 5, minCount: number = 2): Promise<TopicCount[]> {
  // Extract slugs from URLs
  const slugs = urls
    .map(extractSlugFromUrl)
    .filter((slug): slug is string => slug !== null && slug.length > 0);
  
  // If no slugs, return empty
  if (slugs.length === 0) {
    return [];
  }
  
  // Limit slugs to avoid token limits (take a sample if too many)
  const maxSlugs = 100;
  const sampledSlugs = slugs.length > maxSlugs 
    ? slugs.slice(0, maxSlugs) 
    : slugs;
  
  // Deduplicate slugs for cleaner input
  const uniqueSlugs = [...new Set(sampledSlugs)];
  
  try {
    const prompt = `Analyze these URL slugs from a website section and identify the top ${topN} content themes/topics.
Group similar content together and return concise, human-readable topic names (2-4 words max).
Estimate how many of the slugs belong to each topic.

URL slugs:
${uniqueSlugs.map(s => `- ${s}`).join('\n')}

Total URLs in this section: ${urls.length}

Return JSON with this exact structure:
{
  "topics": [
    { "name": "Topic Name", "count": number_of_articles }
  ]
}

Rules:
- Return at most ${topN} topics
- Topic names should be concise and descriptive (e.g., "Virtual Backgrounds", "Webinar Software")
- Count should be your estimate of how many URLs belong to that topic
- Only include topics that have at least ${minCount} related URLs
- IMPORTANT: Detect the language of the URL slugs and return topic names in that SAME language (e.g., if slugs are in French, return French topic names like "Arrière-plans Virtuels")`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TOPIC-EXTRACTION] OpenAI error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('[TOPIC-EXTRACTION] No content in OpenAI response');
      return [];
    }

    const parsed = JSON.parse(content);
    const topics = parsed.topics;
    
    if (!Array.isArray(topics)) {
      console.error('[TOPIC-EXTRACTION] Invalid topics format:', topics);
      return [];
    }

    // Validate and return topics (filter by minCount in case AI doesn't respect it)
    return topics
      .filter((t: unknown): t is TopicCount => 
        typeof t === 'object' && 
        t !== null &&
        typeof (t as TopicCount).name === 'string' && 
        typeof (t as TopicCount).count === 'number' &&
        (t as TopicCount).count >= minCount
      )
      .slice(0, topN);
      
  } catch (error) {
    console.error('[TOPIC-EXTRACTION] Error:', error);
    return [];
  }
}

/**
 * Capitalize first letter of a topic name for display
 * (Kept for backwards compatibility, but AI already returns proper casing)
 */
export function formatTopicName(name: string): string {
  return name;
}
