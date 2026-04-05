const { resolveDomain } = require('../utils/domainResolver');

// Simple in-memory cache to prevent redundant external checks
// Key: companyName, Value: valid logo URL string
const logoCache = new Map();

/**
 * Validates if an image URL returns a 200 OK status
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
async function checkImageExists(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // We try to request the headers. Some services block HEAD, so we use GET but abort early if needed.
    // For logos, the payload is tiny anyway, let's just do GET to avoid 405 Method Not Allowed from CDNs.
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    clearTimeout(timeout);
    
    // 200 OK
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        return true;
      }
      return true; // We accept 200 OK even if content type is missing
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Gets a company logo with progressive fallbacks
 * @param {string} companyName 
 * @returns {Promise<string>} Final valid logo URL
 */
async function getLogoUrl(companyName) {
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || 'C')}&background=random&color=fff&size=200&font-size=0.4`;

  if (!companyName) {
    return fallbackUrl;
  }

  const cacheKey = companyName.toLowerCase().trim();
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey);
  }

  const domain = resolveDomain(companyName);
  
  if (!domain) {
    logoCache.set(cacheKey, fallbackUrl);
    return fallbackUrl;
  }

  // Fallback chain definition
  const urlsToTry = [
    `https://asset.brandfetch.io/${domain}/logo`,
    `https://logo.clearbit.com/${domain}`
  ];

  for (const url of urlsToTry) {
    const exists = await checkImageExists(url);
    if (exists) {
      logoCache.set(cacheKey, url);
      return url;
    }
  }

  // All failed, save fallback to cache
  logoCache.set(cacheKey, fallbackUrl);
  return fallbackUrl;
}

module.exports = {
  getLogoUrl
};
