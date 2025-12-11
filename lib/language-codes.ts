/**
 * ISO 639-1 two-letter language codes (excluding English)
 * Used to filter out non-English localized URLs
 */
export const LANGUAGE_CODES = [
  'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko', 'ar',
  'tr', 'sv', 'da', 'no', 'fi', 'cs', 'hu', 'ro', 'el', 'he', 'th', 'vi',
  'id', 'ms', 'uk', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et', 'is', 'ga',
  'mt', 'cy', 'sq', 'mk', 'sr', 'bs', 'ka', 'hy', 'az', 'kk', 'uz', 'mn',
  'ne', 'si', 'km', 'lo', 'my', 'am', 'ti', 'or', 'ta', 'te', 'kn',
  'ml', 'tl', 'jv', 'su', 'mg', 'haw', 'af', 'sw', 'zu', 'xh',
  'ca', 'gl', 'eu', 'be', 'fa', 'ur', 'hi', 'bn', 'pa', 'gu', 'mr',
];

/**
 * Check if a URL is a non-English localized page
 */
export function isNonEnglishUrl(url: string): boolean {
  // Patterns to match language paths
  for (const lang of LANGUAGE_CODES) {
    // Match /fr/, /fr-ca/, /fr-FR/, etc.
    const pathPattern = new RegExp(`^https?://[^/]+/${lang}(/|$|-[a-z]{2})`, 'i');
    // Match fr.example.com subdomain
    const subdomainPattern = new RegExp(`^https?://${lang}\\.`, 'i');
    
    if (pathPattern.test(url) || subdomainPattern.test(url)) {
      return true;
    }
  }
  return false;
}

/**
 * Filter out non-English URLs from a list
 */
export function filterNonEnglishUrls(urls: string[]): string[] {
  return urls.filter(url => !isNonEnglishUrl(url));
}


