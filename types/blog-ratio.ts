/**
 * Type definitions for Blog-to-Website Ratio analysis
 */

export interface BlogRatioRequest {
  domain: string;
}

export interface TopicCount {
  name: string;
  count: number;
}

export interface FolderGroup {
  folder: string;
  urls: string[];
  count: number;
  topics: TopicCount[];
}

export interface BlogRatioResponse {
  domain: string;
  totalUrls: number;
  blogUrls: number;
  websiteUrls: number;
  blogPercentage: number;
  websitePercentage: number;
  blogUrlsList: string[];
  websiteUrlsList: string[];
  // Grouped website URLs by folder
  websiteFolders: FolderGroup[];
  // Topics extracted from blog URLs
  blogTopics: TopicCount[];
}

export interface BlogRatioProgress {
  step: number;
  percent: number;
  message: string;
}


