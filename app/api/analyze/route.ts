import { NextRequest, NextResponse } from 'next/server';
import { mapWebsite, filterUrls } from '@/lib/firecrawl-service';
import { extractKeywordsFromUrls } from '@/lib/url-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain } = body;

    // Validation
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Clean the domain
    const cleanDomain = domain
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/$/, '');

    console.log(`Analyzing domain: ${cleanDomain}`);

    // Step 1: Map website to discover all URLs
    console.log('Step 1: Mapping website...');
    const allUrls = await mapWebsite(cleanDomain);

    // Step 2: Filter out junk URLs
    console.log('Step 2: Filtering URLs...');
    console.log(`Before filtering: ${allUrls.length} URLs`);
    console.log(`Sample URLs before filter:`, allUrls.slice(0, 10));
    const validUrls = filterUrls(allUrls, cleanDomain);
    console.log(`After filtering: ${validUrls.length} valid URLs`);
    console.log(`Sample valid URLs:`, validUrls.slice(0, 10));

    // Step 3: Extract keywords from URLs
    console.log('Step 3: Extracting keywords from URLs...');
    const urlsWithKeywords = extractKeywordsFromUrls(validUrls);

    if (urlsWithKeywords.length === 0) {
      return NextResponse.json(
        { error: 'No meaningful keywords found in URLs' },
        { status: 400 }
      );
    }

    // Step 4: Extract main topics using Firecrawl v2 API (async)
    console.log(`Step 4: Extracting main topics from ${cleanDomain}...`);

    const extractUrl = `https://${cleanDomain}`;

    // Submit the extraction job
    const extractResponse = await fetch('https://api.firecrawl.dev/v2/extract', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [extractUrl],
        schema: {
          type: 'object',
          properties: {
            topics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Topic name (2-5 words)' },
                  description: { type: 'string', description: 'Brief description of this topic area' },
                },
                required: ['name', 'description'],
              },
              description: 'Top 5 main benefit areas or topic categories of this website',
            },
          },
          required: ['topics'],
        },
        prompt: 'Analyze this website homepage and identify the top 5 main benefit areas, topic categories, or sections that this website offers. These should be high-level themes',
      }),
    });

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('Firecrawl extract error:', extractResponse.status, errorText);
      throw new Error(`Firecrawl extract returned ${extractResponse.status}: ${errorText}`);
    }

    const extractJob = await extractResponse.json();
    console.log('Extract job submitted:', JSON.stringify(extractJob, null, 2));

    if (!extractJob.success || !extractJob.id) {
      throw new Error('Failed to submit extract job');
    }

    // Poll for job completion
    const jobId = extractJob.id;
    console.log(`Polling for extract job ${jobId}...`);

    let extractData;
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 2s = 2 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(`https://api.firecrawl.dev/v2/extract/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Firecrawl status check error:', statusResponse.status, errorText);
        throw new Error(`Failed to check extract job status: ${statusResponse.status}`);
      }

      extractData = await statusResponse.json();
      console.log(`Job status (attempt ${attempts + 1}):`, extractData.status);

      if (extractData.status === 'completed') {
        console.log('Extract job completed!');
        break;
      } else if (extractData.status === 'failed' || extractData.status === 'cancelled') {
        throw new Error(`Extract job ${extractData.status}: ${extractData.error || 'Unknown error'}`);
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Extract job timed out after 2 minutes');
    }

    console.log('Extract response:', JSON.stringify(extractData, null, 2));

    // V2 API returns data directly
    const topics = extractData.data?.topics || [];
    console.log(`Topic extraction complete! Found ${topics.length} main topics`);

    if (topics.length === 0) {
      return NextResponse.json({
        domain: cleanDomain,
        topics: [],
        urls: urlsWithKeywords,
        total_urls: allUrls.length,
        valid_urls: validUrls.length,
        urls_with_keywords: urlsWithKeywords.length,
      });
    }

    // Step 5: Classify URLs into the 5 main topics
    console.log(`Step 5: Classifying ${urlsWithKeywords.length} URLs into topics...`);

    const topicNames: string[] = topics.map((t: { name: string }) => t.name);
    console.log('Topic names:', topicNames);

    // Prepare URLs for classification (limit data to avoid token limits)
    const urlsForClassification = urlsWithKeywords.map(u => ({
      url: u.url,
      keywords: u.keywords
    }));

    console.log(`Prepared ${urlsForClassification.length} URLs for classification`);

    // Batch URLs to avoid timeout (50 URLs per batch)
    const BATCH_SIZE = 50;
    const batches = [];
    for (let i = 0; i < urlsForClassification.length; i += BATCH_SIZE) {
      batches.push(urlsForClassification.slice(i, i + BATCH_SIZE));
    }

    console.log(`Split into ${batches.length} batches of max ${BATCH_SIZE} URLs each`);

    let allClassifications: any[] = [];

    // Process batches sequentially
    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];
      console.log(`Processing batch ${batchIdx + 1}/${batches.length} (${batch.length} URLs)...`);

      const classificationPrompt = `You are classifying website URLs into topic categories.

Main Topics:
${topicNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Task: Classify each URL below into ONE of the topics above (use exact topic name), or mark as "outlier" if it doesn't fit any topic.

URLs to classify:
${JSON.stringify(batch, null, 2)}

Return a JSON object with this structure:
{
  "results": [
    { "url": "full URL here", "topic": "exact topic name or 'outlier'" }
  ]
}`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: classificationPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error(`OpenAI classification error (batch ${batchIdx + 1}):`, openaiResponse.status, errorText);
        throw new Error(`OpenAI classification failed: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const classificationText = openaiData.choices[0].message.content;

      try {
        const parsed = JSON.parse(classificationText);

        // Try multiple possible response formats
        const batchClassifications = parsed.results || parsed.classifications || parsed.urls || (Array.isArray(parsed) ? parsed : []);

        if (!Array.isArray(batchClassifications)) {
          console.error(`Batch ${batchIdx + 1} classifications is not an array:`, batchClassifications);
          throw new Error('Invalid classification format - expected array');
        }

        allClassifications = allClassifications.concat(batchClassifications);
        console.log(`Batch ${batchIdx + 1} complete: ${batchClassifications.length} classifications`);
      } catch (error) {
        console.error(`Failed to parse OpenAI response for batch ${batchIdx + 1}:`, error);
        throw new Error(`Failed to parse classification results for batch ${batchIdx + 1}`);
      }

      // Small delay between batches to avoid rate limiting
      if (batchIdx < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Total classifications received: ${allClassifications.length}`);
    const classifications = allClassifications;

    // Define types for topic with URLs
    interface TopicWithUrls {
      name: string;
      description: string;
      urls: { url: string; keywords: string }[];
      count: number;
    }

    // Group URLs by topic
    const topicsWithUrls: TopicWithUrls[] = topics.map((topic: { name: string; description: string }) => ({
      ...topic,
      urls: [] as { url: string; keywords: string }[],
      count: 0,
    }));

    const outliers: { url: string; keywords: string }[] = [];
    let unmatchedCount = 0;

    console.log('Starting URL grouping...');
    console.log('Available topics:', topicsWithUrls.map((t: TopicWithUrls) => t.name));

    classifications.forEach((classification: { url?: string; topic?: string }, idx: number) => {
      if (!classification.url || !classification.topic) {
        console.warn(`Classification ${idx} missing url or topic:`, classification);
        return;
      }

      const urlData = urlsWithKeywords.find(u => u.url === classification.url);
      if (!urlData) {
        console.warn(`URL not found in urlsWithKeywords: ${classification.url}`);
        unmatchedCount++;
        return;
      }

      if (classification.topic.toLowerCase() === 'outlier') {
        outliers.push(urlData);
      } else {
        // Try exact match first
        let topicIndex = topicsWithUrls.findIndex((t: TopicWithUrls) =>
          t.name.toLowerCase() === classification.topic!.toLowerCase()
        );

        // If no exact match, try fuzzy match
        if (topicIndex < 0) {
          topicIndex = topicsWithUrls.findIndex((t: TopicWithUrls) =>
            t.name.toLowerCase().includes(classification.topic!.toLowerCase()) ||
            classification.topic!.toLowerCase().includes(t.name.toLowerCase())
          );
        }

        if (topicIndex >= 0) {
          topicsWithUrls[topicIndex].urls.push(urlData);
          topicsWithUrls[topicIndex].count++;
        } else {
          // If topic not found, add to outliers
          console.warn(`Topic not matched: "${classification.topic}" for URL: ${urlData.url}`);
          outliers.push(urlData);
        }
      }
    });

    // Sort outliers alphabetically by URL
    outliers.sort((a, b) => a.url.localeCompare(b.url));

    console.log(`\n=== Classification Summary ===`);
    console.log(`Total classifications: ${classifications.length}`);
    console.log(`URLs with keywords: ${urlsWithKeywords.length}`);
    console.log(`Unmatched URLs: ${unmatchedCount}`);
    console.log(`Outliers: ${outliers.length}`);
    console.log('\nTopic distribution:');
    topicsWithUrls.forEach(t => {
      console.log(`  ${t.name}: ${t.count} pages`);
    });
    console.log('===========================\n');

    return NextResponse.json({
      domain: cleanDomain,
      topics: topicsWithUrls,
      outliers: outliers,
      outlier_count: outliers.length,
      total_urls: allUrls.length,
      valid_urls: validUrls.length,
      urls_with_keywords: urlsWithKeywords.length,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze domain';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
