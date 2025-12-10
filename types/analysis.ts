/**
 * Type definitions for Serpa analysis API
 */

// URL with extracted keywords
export interface UrlWithKeywords {
  url: string;
  keywords: string;
}

// Topic extracted from website
export interface Topic {
  name: string;
  description: string;
  urls: UrlWithKeywords[];
  count: number;
}

// Analysis request body
export interface AnalysisRequest {
  domain: string;
}

// Analysis response from API
export interface AnalysisResponse {
  domain: string;
  topics: Topic[];
  outliers: UrlWithKeywords[];
  outlier_count: number;
  total_urls: number;
  valid_urls: number;
  urls_with_keywords: number;
}

// Analysis error response
export interface AnalysisError {
  error: string;
}

// Progress state for UI
export interface AnalysisProgress {
  step: number;
  percent: number;
  message: string;
}

