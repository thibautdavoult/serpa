# Serpa — SEO Tools Ideas & Backlog

> **Note:** This is a personal reference document for tool ideas. Not part of the product documentation.  
> Last updated: December 2025

---

## ✅ Built / In Progress

### Website Topic Analyzer (MVP)
- [x] Analyze website and cluster pages into topic categories
- [x] Outlier detection for pages that don't fit topics
- [x] Visual dashboard with expandable topic cards

### Blog-to-Website Ratio Analyzer
- [ ] Calculate ratio of blog content vs website pages
- [ ] Site structure visualization (tree/mind map)
- [ ] Folder grouping analysis

---

## 💡 Tool Ideas

### Content & Structure Analysis

#### Internal Link Analyzer
- Map internal linking structure between pages
- Identify orphan pages (no internal links pointing to them)
- Find pages with too few/too many internal links
- Visualize link flow between topic clusters

#### Content Gap Finder
- Compare your topics vs competitor topics
- Identify topics competitors cover that you don't
- Suggest new content opportunities based on gaps

#### Duplicate Content Detector
- Find pages with similar/duplicate content
- Identify thin content pages (low word count)
- Detect cannibalization (multiple pages targeting same keywords)

#### URL Structure Auditor
- Analyze URL depth and structure patterns
- Identify inconsistent URL naming conventions
- Flag problematic URLs (too long, special characters, etc.)
- Suggest URL structure improvements

#### Site Hierarchy Mapper
- Visualize full site architecture
- Identify pages buried too deep (>3 clicks from homepage)
- Analyze category/subcategory organization

---

### Technical SEO

#### Page Speed Insights Aggregator
- Batch analyze page speeds across the site
- Group by page type (blog, product, landing pages)
- Identify slowest pages/sections
- Track improvements over time

#### Mobile Usability Scanner
- Check mobile-friendliness across all pages
- Identify common mobile issues per section
- Prioritize fixes by traffic/importance

#### Core Web Vitals Monitor
- Track LCP, FID, CLS across the site
- Group results by template/page type
- Historical tracking and alerts

#### Indexability Checker
- Verify which pages are indexable
- Detect conflicting signals (noindex + sitemap, etc.)
- Check robots.txt coverage
- Validate canonical tags

#### Schema Markup Auditor
- Detect existing schema on pages
- Identify missing schema opportunities
- Validate schema implementation
- Suggest schema types by page type

---

### Keyword & SERP Analysis

#### Keyword Clustering Tool
- Input list of keywords, cluster by intent/topic
- Map keywords to existing content
- Identify keyword gaps

#### SERP Feature Tracker
- Track featured snippets, PAA, local packs for keywords
- Monitor SERP feature changes over time
- Identify SERP feature opportunities

#### Competitor Content Analyzer
- Analyze competitor's content structure
- Compare topic coverage side-by-side
- Find their top-performing content themes

#### Search Intent Classifier
- Classify URLs/keywords by search intent
- Informational vs transactional vs navigational
- Map content to funnel stages

---

### Content Optimization

#### Title/Meta Optimizer
- Audit all title tags and meta descriptions
- Flag missing, duplicate, or too long/short
- AI-powered suggestions for improvements

#### Heading Structure Analyzer
- Check H1-H6 hierarchy on all pages
- Identify missing H1s, skipped heading levels
- Analyze heading keyword coverage

#### Image SEO Auditor
- Check alt text coverage
- Identify oversized images
- Find broken image links
- Suggest alt text improvements

#### Content Freshness Tracker
- Identify stale content by last modified date
- Prioritize updates by traffic/importance
- Track content update frequency

---

### Competitive Intelligence

#### Domain Comparison Tool
- Compare topic coverage across multiple domains
- Side-by-side site structure comparison
- Identify competitive advantages/gaps

#### Backlink Gap Analyzer
- Find sites linking to competitors but not you
- Identify link building opportunities
- Analyze competitor backlink profiles

#### Share of Voice Calculator
- Track visibility across a set of keywords
- Compare against competitors
- Monitor changes over time

---

### Reporting & Exports

#### SEO Health Score
- Aggregate score based on multiple factors
- Breakdown by category (content, technical, etc.)
- Actionable recommendations

#### Executive Summary Generator
- AI-generated report summaries
- Key findings and recommendations
- Shareable PDF/link

#### CSV/PDF Export
- Export any analysis to CSV or PDF
- Customizable report templates
- Scheduled exports

---

## 🔮 Future Platform Features

### User Experience
- [ ] User authentication (NextAuth.js)
- [ ] Analysis history (saved reports)
- [ ] Dashboard with all tools
- [ ] Project organization (group sites)

### Monetization
- [ ] Stripe integration
- [ ] Usage-based pricing
- [ ] Free tier with limits
- [ ] Team plans

### Integrations
- [ ] Google Search Console connection
- [ ] Google Analytics integration
- [ ] Slack/email notifications
- [ ] API access for developers
- [ ] Zapier integration

### Data & Storage
- [ ] Database for historical data
- [ ] Comparison over time
- [ ] Automated re-crawls
- [ ] Alerting on changes

---

## 📝 Notes & Ideas

### Potential Differentiators
- Speed: Get insights in <2 minutes
- Simplicity: One input, clear output
- Visual: Beautiful, shareable visualizations
- AI-first: Use AI for classification, summaries, recommendations

### Target Users
- In-house SEOs at SMBs
- Freelance SEO consultants
- Content strategists
- Digital marketing agencies

### Pricing Thoughts
- Free: 2-3 analyses per day
- Starter ($9/mo): 10 analyses/day, basic tools
- Pro ($29/mo): Unlimited, all tools
- Agency ($99/mo): Team features, white-label

---

## 🗂️ Prioritization Framework

When picking the next tool to build, consider:
1. **User demand** — What are users asking for?
2. **Differentiation** — Does this make us unique?
3. **Technical feasibility** — Can we build it with current stack?
4. **API costs** — What's the cost per analysis?
5. **Monetization potential** — Will users pay for this?

---

*This document is for brainstorming and planning only. It does not represent committed features or roadmap.*
