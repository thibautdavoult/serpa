# Serpa — Website Topic Analyzer

A focused SEO tool that analyzes websites and automatically discovers content topics by clustering pages.

## Features

- **One Input, One Output**: Enter a domain, get instant topic analysis
- **AI-Powered Classification**: Uses Firecrawl + OpenAI to extract and classify topics
- **Visual Dashboard**: See all your website's topic areas at a glance
- **Outlier Detection**: Identify pages that don't fit into main topic clusters

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **APIs**: Firecrawl (site mapping), OpenAI (classification)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd serpa
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
   - `FIRECRAWL_API_KEY` — Get from [firecrawl.dev](https://www.firecrawl.dev/)
   - `OPENAI_API_KEY` — Get from [OpenAI Platform](https://platform.openai.com/api-keys)

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Website Mapping**: Firecrawl discovers all URLs on the target domain
2. **URL Filtering**: Removes pagination, language variants, admin pages, etc.
3. **Keyword Extraction**: Extracts semantic keywords from URL slugs
4. **Topic Extraction**: Firecrawl v2 identifies main topics from the homepage
5. **Classification**: OpenAI classifies each URL into the extracted topics
6. **Results**: Dashboard shows topics with page counts and outliers

## Project Structure

```
serpa/
├── app/
│   ├── api/analyze/      # API route for domain analysis
│   ├── app/              # Main application page
│   └── page.tsx          # Landing page
├── components/
│   ├── analysis/         # Analysis-specific components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── firecrawl-service.ts  # Firecrawl API integration
│   └── url-parser.ts         # URL keyword extraction
└── types/
    └── analysis.ts       # TypeScript type definitions
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## License

MIT

