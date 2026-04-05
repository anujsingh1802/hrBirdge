const popularDomains = {
  'google': 'google.com',
  'google inc.': 'google.com',
  'google inc': 'google.com',
  'amazon': 'amazon.com',
  'amazon com': 'amazon.com',
  'apple': 'apple.com',
  'apple inc.': 'apple.com',
  'microsoft': 'microsoft.com',
  'microsoft corp': 'microsoft.com',
  'meta': 'meta.com',
  'facebook': 'meta.com',
  'netflix': 'netflix.com',
  'stripe': 'stripe.com',
  'openai': 'openai.com',
  'coursera': 'coursera.org',
  'udemy': 'udemy.com',
  'github': 'github.com',
  'linkedin': 'linkedin.com',
  'twitter': 'twitter.com',
  'x': 'x.com'
};

/**
 * Normalizes a company name into a best-guess domain
 * @param {string} companyName 
 * @returns {string} Domain string
 */
function resolveDomain(companyName) {
  if (!companyName) return null;

  const name = companyName.toLowerCase().trim();

  // 1. Check direct popular static mapping
  if (popularDomains[name]) {
    return popularDomains[name];
  }

  // 2. Direct domains provided (e.g. "example.com")
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(name)) {
    return name;
  }

  // 3. Fallback normalization: remove special chars, spaces, inc, corp, llc
  let normalized = name
    .replace(/\b(inc\.?|corp\.?|llc|ltd\.?|company)\b/gi, '')
    .replace(/[^a-z0-9]/g, ''); // strip spaces and special characters

  if (!normalized) return null;

  return `${normalized}.com`;
}

module.exports = { resolveDomain };
