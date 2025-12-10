# Product Requirements Document

## Serpa — Website Topic Analyzer

**Version 1.1 — December 2025 — MVP Scope**

---

## 1. Overview

### 1.1 Problem Statement

Website owners and SEOs struggle to understand how their content is organized at scale. As websites grow, it becomes difficult to identify content themes, spot gaps, and find pages that don't fit into any clear category.

### 1.2 Solution

Serpa is a micro SaaS that analyzes any website and automatically clusters its pages into topic categories. Users get an instant bird's-eye view of their content structure, helping them identify opportunities and organize their SEO strategy.

### 1.3 Value Proposition

- **Simplicity:** One input (domain), one output (topic map). No learning curve.
- **Actionable:** Visual breakdown shows exactly how content is organized.
- **Fast ROI:** Understand any website's content structure in under 2 minutes.

### 1.4 Target User

In-house SEOs and content strategists at small-to-medium businesses who need quick insights into website content organization. They want to understand topic coverage without manually auditing hundreds of pages.

---

## 2. User Flow

### 2.1 Core Flow (MVP)

1. **Input Domain:** User enters a website domain (e.g., "stripe.com").
2. **Discover URLs:** System maps all URLs on the website using Firecrawl.
3. **Filter URLs:** System removes junk URLs (pagination, admin, language variants, etc.).
4. **Extract Topics:** System identifies main topic areas from the homepage.
5. **Classify Pages:** System categorizes each URL into a topic using AI.
6. **Display Results:** Visual dashboard shows topics, page counts, and outliers.

### 2.2 Results Display

For each topic, display:

- Topic name and description
- Number of pages in that topic
- Expandable list of URLs with extracted keywords
- Visual indicator of topic coverage

### 2.3 Summary View

- Total URLs discovered and analyzed
- Number of main topics identified
- Count of outlier pages (don't fit any topic)
- Expandable topic cards with page details

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Hosting | Vercel |

### 3.2 External APIs

| API | Purpose | Notes |
|-----|---------|-------|
| Firecrawl | Map website URLs, extract homepage topics | /map and /v2/extract endpoints |
| OpenAI | Classify URLs into topics | GPT-4o-mini for cost efficiency |

### 3.3 Data Flow

```
Domain Input
    ↓
Firecrawl /map → Discover all URLs
    ↓
URL Filtering → Remove junk URLs
    ↓
Keyword Extraction → Parse URL slugs
    ↓
Firecrawl /extract → Get main topics from homepage
    ↓
OpenAI Classification → Assign URLs to topics
    ↓
Results Dashboard
```

---

## 4. Design Guidelines

### 4.1 Visual Style

- **Aesthetic:** Clean, minimal — inspired by Attio, Qonto, Linear
- **Mode:** Light mode only (no dark mode for MVP)
- **Colors:** Muted palette with grays + one accent color
- **Typography:** Clear hierarchy, generous spacing, professional B2B SaaS look

### 4.2 UI Principles

- Use shadcn/ui components exclusively
- Minimal customization — stick to defaults
- No complex animations — simple hover states only
- Generous white space, subtle borders (not heavy shadows)
- Focus on clarity and readability

---

## 5. MVP Scope

### 5.1 Included in MVP

1. Domain input (single domain at a time)
2. URL discovery via Firecrawl
3. Automatic URL filtering
4. Keyword extraction from URL slugs
5. Topic extraction from homepage
6. AI-powered URL classification
7. Visual results dashboard
8. Expandable topic cards with URLs
9. Outlier page identification

### 5.2 Out of Scope (Future)

1. User authentication
2. Saved analysis history
3. Multi-domain comparison
4. Content gap analysis
5. Export to CSV/PDF
6. Custom topic definitions
7. Historical tracking over time
8. API access for developers

---

## 6. Pricing Model (Future)

| Tier | Analysis Limit | Price |
|------|----------------|-------|
| Free | 2 analyses per day | $0 |
| Starter | 10 analyses per day | $9/month |
| Pro | Unlimited analyses | $29/month |

**Note:** Authentication and payments to be implemented post-MVP.

---

## 7. Success Metrics

- **Activation:** % of visitors who complete their first analysis
- **Return Usage:** Users coming back for additional analyses
- **Time to Value:** Average time from landing to results
- **Error Rate:** % of analyses that fail

---

## 8. Open Questions

- Should we add page title/description scraping for better classification?
- How do we handle very large websites (10k+ URLs)?
- Should we cache results for repeat analyses of the same domain?
- What's the optimal batch size for OpenAI classification?

---

## 9. Next Steps

1. ✅ Set up Next.js project with shadcn/ui
2. ✅ Build core analysis flow (input → API call → results)
3. ✅ Implement URL filtering and keyword extraction
4. ⬜ Add authentication (NextAuth.js)
5. ⬜ Add Stripe integration
6. ⬜ Deploy MVP and gather user feedback
