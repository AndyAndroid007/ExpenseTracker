/**
 * lib/regionContext.js
 *
 * Maps an IANA timezone string (e.g. "Asia/Kolkata") to a structured
 * region context object used to inform the LLM about the user's locale,
 * currency, and country — with zero external dependencies.
 *
 * The lookup table covers the most common timezones globally.
 * Unknown timezones fall back to a neutral USD/English context.
 */

/**
 * Compact IANA timezone → region mapping.
 * Keys are IANA timezone strings; values are { locale, currency, symbol, region }.
 */
const TIMEZONE_REGION_MAP = {
  // ── India ──────────────────────────────────────────────────────────────────
  'Asia/Kolkata':   { locale: 'en-IN', currency: 'INR', symbol: '₹', region: 'India' },
  'Asia/Calcutta':  { locale: 'en-IN', currency: 'INR', symbol: '₹', region: 'India' },

  // ── United States ──────────────────────────────────────────────────────────
  'America/New_York':    { locale: 'en-US', currency: 'USD', symbol: '$',  region: 'United States (East)' },
  'America/Chicago':     { locale: 'en-US', currency: 'USD', symbol: '$',  region: 'United States (Central)' },
  'America/Denver':      { locale: 'en-US', currency: 'USD', symbol: '$',  region: 'United States (Mountain)' },
  'America/Los_Angeles': { locale: 'en-US', currency: 'USD', symbol: '$',  region: 'United States (West)' },
  'America/Phoenix':     { locale: 'en-US', currency: 'USD', symbol: '$',  region: 'United States (Arizona)' },
  'America/Anchorage':   { locale: 'en-US', currency: 'USD', symbol: '$',  region: 'United States (Alaska)' },
  'Pacific/Honolulu':    { locale: 'en-US', currency: 'USD', symbol: '$',  region: 'United States (Hawaii)' },

  // ── United Kingdom ─────────────────────────────────────────────────────────
  'Europe/London':  { locale: 'en-GB', currency: 'GBP', symbol: '£', region: 'United Kingdom' },

  // ── European Union ─────────────────────────────────────────────────────────
  'Europe/Paris':       { locale: 'fr-FR', currency: 'EUR', symbol: '€', region: 'France' },
  'Europe/Berlin':      { locale: 'de-DE', currency: 'EUR', symbol: '€', region: 'Germany' },
  'Europe/Madrid':      { locale: 'es-ES', currency: 'EUR', symbol: '€', region: 'Spain' },
  'Europe/Rome':        { locale: 'it-IT', currency: 'EUR', symbol: '€', region: 'Italy' },
  'Europe/Amsterdam':   { locale: 'nl-NL', currency: 'EUR', symbol: '€', region: 'Netherlands' },
  'Europe/Brussels':    { locale: 'fr-BE', currency: 'EUR', symbol: '€', region: 'Belgium' },
  'Europe/Vienna':      { locale: 'de-AT', currency: 'EUR', symbol: '€', region: 'Austria' },
  'Europe/Lisbon':      { locale: 'pt-PT', currency: 'EUR', symbol: '€', region: 'Portugal' },
  'Europe/Athens':      { locale: 'el-GR', currency: 'EUR', symbol: '€', region: 'Greece' },
  'Europe/Helsinki':    { locale: 'fi-FI', currency: 'EUR', symbol: '€', region: 'Finland' },
  'Europe/Stockholm':   { locale: 'sv-SE', currency: 'SEK', symbol: 'kr', region: 'Sweden' },
  'Europe/Copenhagen':  { locale: 'da-DK', currency: 'DKK', symbol: 'kr', region: 'Denmark' },
  'Europe/Oslo':        { locale: 'nb-NO', currency: 'NOK', symbol: 'kr', region: 'Norway' },
  'Europe/Zurich':      { locale: 'de-CH', currency: 'CHF', symbol: 'Fr', region: 'Switzerland' },
  'Europe/Warsaw':      { locale: 'pl-PL', currency: 'PLN', symbol: 'zł', region: 'Poland' },
  'Europe/Prague':      { locale: 'cs-CZ', currency: 'CZK', symbol: 'Kč', region: 'Czech Republic' },
  'Europe/Budapest':    { locale: 'hu-HU', currency: 'HUF', symbol: 'Ft', region: 'Hungary' },
  'Europe/Bucharest':   { locale: 'ro-RO', currency: 'RON', symbol: 'lei', region: 'Romania' },
  'Europe/Sofia':       { locale: 'bg-BG', currency: 'BGN', symbol: 'лв', region: 'Bulgaria' },
  'Europe/Kiev':        { locale: 'uk-UA', currency: 'UAH', symbol: '₴', region: 'Ukraine' },
  'Europe/Kyiv':        { locale: 'uk-UA', currency: 'UAH', symbol: '₴', region: 'Ukraine' },

  // ── Middle East ────────────────────────────────────────────────────────────
  'Asia/Dubai':    { locale: 'ar-AE', currency: 'AED', symbol: 'د.إ', region: 'UAE' },
  'Asia/Riyadh':   { locale: 'ar-SA', currency: 'SAR', symbol: '﷼',  region: 'Saudi Arabia' },
  'Asia/Qatar':    { locale: 'ar-QA', currency: 'QAR', symbol: '﷼',  region: 'Qatar' },
  'Asia/Kuwait':   { locale: 'ar-KW', currency: 'KWD', symbol: 'د.ك', region: 'Kuwait' },
  'Asia/Bahrain':  { locale: 'ar-BH', currency: 'BHD', symbol: '.د.ب', region: 'Bahrain' },
  'Asia/Tehran':   { locale: 'fa-IR', currency: 'IRR', symbol: '﷼',  region: 'Iran' },
  'Asia/Jerusalem':{ locale: 'he-IL', currency: 'ILS', symbol: '₪',  region: 'Israel' },
  'Asia/Beirut':   { locale: 'ar-LB', currency: 'LBP', symbol: 'ل.ل', region: 'Lebanon' },

  // ── South / Southeast Asia ────────────────────────────────────────────────
  'Asia/Karachi':         { locale: 'ur-PK', currency: 'PKR', symbol: '₨', region: 'Pakistan' },
  'Asia/Dhaka':           { locale: 'bn-BD', currency: 'BDT', symbol: '৳', region: 'Bangladesh' },
  'Asia/Colombo':         { locale: 'si-LK', currency: 'LKR', symbol: '₨', region: 'Sri Lanka' },
  'Asia/Kathmandu':       { locale: 'ne-NP', currency: 'NPR', symbol: '₨', region: 'Nepal' },
  'Asia/Yangon':          { locale: 'my-MM', currency: 'MMK', symbol: 'K',  region: 'Myanmar' },
  'Asia/Bangkok':         { locale: 'th-TH', currency: 'THB', symbol: '฿', region: 'Thailand' },
  'Asia/Ho_Chi_Minh':     { locale: 'vi-VN', currency: 'VND', symbol: '₫', region: 'Vietnam' },
  'Asia/Jakarta':         { locale: 'id-ID', currency: 'IDR', symbol: 'Rp', region: 'Indonesia' },
  'Asia/Kuala_Lumpur':    { locale: 'ms-MY', currency: 'MYR', symbol: 'RM', region: 'Malaysia' },
  'Asia/Singapore':       { locale: 'en-SG', currency: 'SGD', symbol: 'S$', region: 'Singapore' },
  'Asia/Manila':          { locale: 'fil-PH', currency: 'PHP', symbol: '₱', region: 'Philippines' },

  // ── East Asia ──────────────────────────────────────────────────────────────
  'Asia/Shanghai':  { locale: 'zh-CN', currency: 'CNY', symbol: '¥', region: 'China' },
  'Asia/Chongqing': { locale: 'zh-CN', currency: 'CNY', symbol: '¥', region: 'China' },
  'Asia/Hong_Kong': { locale: 'zh-HK', currency: 'HKD', symbol: 'HK$', region: 'Hong Kong' },
  'Asia/Taipei':    { locale: 'zh-TW', currency: 'TWD', symbol: 'NT$', region: 'Taiwan' },
  'Asia/Tokyo':     { locale: 'ja-JP', currency: 'JPY', symbol: '¥', region: 'Japan' },
  'Asia/Seoul':     { locale: 'ko-KR', currency: 'KRW', symbol: '₩', region: 'South Korea' },

  // ── Oceania ────────────────────────────────────────────────────────────────
  'Australia/Sydney':   { locale: 'en-AU', currency: 'AUD', symbol: 'A$', region: 'Australia (NSW/VIC)' },
  'Australia/Melbourne':{ locale: 'en-AU', currency: 'AUD', symbol: 'A$', region: 'Australia (VIC)' },
  'Australia/Brisbane': { locale: 'en-AU', currency: 'AUD', symbol: 'A$', region: 'Australia (QLD)' },
  'Australia/Perth':    { locale: 'en-AU', currency: 'AUD', symbol: 'A$', region: 'Australia (WA)' },
  'Australia/Adelaide': { locale: 'en-AU', currency: 'AUD', symbol: 'A$', region: 'Australia (SA)' },
  'Pacific/Auckland':   { locale: 'en-NZ', currency: 'NZD', symbol: 'NZ$', region: 'New Zealand' },

  // ── Americas (ex-US) ──────────────────────────────────────────────────────
  'America/Toronto':     { locale: 'en-CA', currency: 'CAD', symbol: 'CA$', region: 'Canada (East)' },
  'America/Vancouver':   { locale: 'en-CA', currency: 'CAD', symbol: 'CA$', region: 'Canada (West)' },
  'America/Sao_Paulo':   { locale: 'pt-BR', currency: 'BRL', symbol: 'R$',  region: 'Brazil' },
  'America/Mexico_City': { locale: 'es-MX', currency: 'MXN', symbol: 'MX$', region: 'Mexico' },
  'America/Buenos_Aires':{ locale: 'es-AR', currency: 'ARS', symbol: '$',   region: 'Argentina' },
  'America/Bogota':      { locale: 'es-CO', currency: 'COP', symbol: 'COP$', region: 'Colombia' },
  'America/Lima':        { locale: 'es-PE', currency: 'PEN', symbol: 'S/',   region: 'Peru' },
  'America/Santiago':    { locale: 'es-CL', currency: 'CLP', symbol: 'CLP$', region: 'Chile' },

  // ── Africa ─────────────────────────────────────────────────────────────────
  'Africa/Lagos':        { locale: 'en-NG', currency: 'NGN', symbol: '₦', region: 'Nigeria' },
  'Africa/Nairobi':      { locale: 'sw-KE', currency: 'KES', symbol: 'KSh', region: 'Kenya' },
  'Africa/Johannesburg': { locale: 'en-ZA', currency: 'ZAR', symbol: 'R',  region: 'South Africa' },
  'Africa/Cairo':        { locale: 'ar-EG', currency: 'EGP', symbol: 'ج.م', region: 'Egypt' },
  'Africa/Casablanca':   { locale: 'ar-MA', currency: 'MAD', symbol: 'DH', region: 'Morocco' },
  'Africa/Accra':        { locale: 'en-GH', currency: 'GHS', symbol: 'GH₵', region: 'Ghana' },
};

/** Neutral fallback for unrecognised timezones */
const FALLBACK_CONTEXT = {
  locale: 'en-IN',
  currency: 'INR',
  symbol: '₹',
  region: 'India',
};

/**
 * Resolves an IANA timezone string to a structured region context.
 *
 * @param {string|null|undefined} ianaTimezone - e.g. "Asia/Kolkata"
 * @returns {{ locale: string, currency: string, symbol: string, region: string }}
 */
export function getRegionContext(ianaTimezone) {
  if (!ianaTimezone || typeof ianaTimezone !== 'string') {
    return FALLBACK_CONTEXT;
  }
  return TIMEZONE_REGION_MAP[ianaTimezone] ?? FALLBACK_CONTEXT;
}

/**
 * Formats the region context as a compact LLM-ready context string to inject
 * into system prompts.
 *
 * @param {string|null|undefined} ianaTimezone
 * @returns {string}
 */
export function buildRegionContextBlock(ianaTimezone) {
  const ctx = getRegionContext(ianaTimezone);
  return [
    `- User's Region: ${ctx.region}`,
    `- Local Currency: ${ctx.currency} (symbol: ${ctx.symbol})`,
    `- Locale: ${ctx.locale}`,
    `- When expressing amounts, always use the ${ctx.currency} currency symbol (${ctx.symbol}) and locale-appropriate formatting.`,
  ].join('\n');
}
