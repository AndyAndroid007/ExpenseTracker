// Centralized regular expression patterns for parser matching

// Intent Classifier Patterns
export const GREETING_PATTERN = /\b(?:hi|hello|hey|yo|sup|good\s+morning|good\s+evening)\b/i;
export const QUERY_PATTERN = /\b(?:how|what|show|list|total|streak|insight|insights|why|who|when|can\s+you|suggest|recommend|tip|tips|strategy|strategies|method|methods|advice|guide)\b/i;

// Logging Parser Entry Type Patterns
export const NO_SPEND_PATTERN = /\b(?:no|zero|0|did\s+not|didn'?t)\s+spend(?:ing)?\b/i;
export const SAVE_DAY_PATTERN = /\b(?:save-day|save_day|saved?\s+(?:money|today|yesterday|day)|saved?\s+(?:₹|\$|€|£|rs\.?|inr)?\s*\d+)\b/i;

// Amount Extraction Pattern
export const AMOUNT_REGEX = /(?:₹|\$|€|£|rs\.?|inr|usd|eur|bucks)?\s*(\d+(?:[\.,]\d+)*)\s*(k|kilo|grand|grands)?\s*(?:rs\.?|inr|usd|eur|bucks)?/gi;

// Date Parsing Patterns
export const DAYS_BEFORE_YESTERDAY_REGEX = /\b(\d+)\s+days?\s+before\s+yesterday\b/i;
export const DAY_BEFORE_YESTERDAY_REGEX = /\bday\s+before\s+yesterday\b/i;
export const YESTERDAY_REGEX = /\byesterday\b/i;
export const TOMORROW_REGEX = /\btomorrow\b/i;
export const TODAY_REGEX = /\btoday\b/i;
export const DAYS_BEFORE_REGEX = /\b(?:before\s+(\d+)\s+days?|(\d+)\s+days?\s+(?:ago|back|before))\b/i;
export const DAYS_AFTER_REGEX = /\b(?:after\s+(\d+)\s+days?|(\d+)\s+days?\s+(?:later|after))\b/i;

// Centralized Parser Constants & Sets

// Intent Stop Words
export const INTENT_STOP_WORDS = new Set([
    'the', 'a', 'an', 'on', 'at', 'to', 'for', 'is', 'are', 'in', 'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those'
]);

// Merchant Stop Words
export const MERCHANT_STOP_WORDS = new Set([
    'spent', 'spent on', 'spent for', 'paid', 'paid to', 'paid for', 
    'bought', 'buy', 'purchase', 'on', 'at', 'to', 'for', 'the', 'a', 
    'in', 'of', 'with', 'by', 'from', 'today', 'yesterday', 'tomorrow',
    'rs', 'rs.', 'rupees', 'inr', 'bucks', 'amount', 'expense', 'money',
    'around', 'about', 'onwards', 'roughly', 'approx', 'approximately'
]);

// Weekday Mapping
export const WEEKDAYS = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
};

// Category Keywords Mapping
export const CATEGORY_KEYWORDS = {
    Food: ['food', 'lunch', 'dinner', 'breakfast', 'zomato', 'swiggy', 'restaurant', 'cafe', 'coffee', 'starbucks', 'grocery', 'groceries', 'tea', 'snack', 'snacks', 'eat', 'burger', 'pizza', 'biryani', 'mcdonalds', 'kfc', 'subway', 'dominos', 'dining', 'bakery'],
    Transport: ['uber', 'ola', 'metro', 'bus', 'auto', 'petrol', 'transport', 'cab', 'taxi', 'train', 'flight', 'diesel', 'fuel', 'fare', 'ride'],
    Shopping: ['amazon', 'flipkart', 'shopping', 'clothes', 'mall', 'purchase', 'buy', 'gift', 'shoes', 'gadget', 'device'],
    Entertainment: ['movie', 'netflix', 'spotify', 'outing', 'cinema', 'concert', 'bar', 'pub', 'club', 'game', 'gaming', 'show', 'ticket', 'party', 'drinks'],
    Bills: ['rent', 'electricity', 'wifi', 'bill', 'water', 'gas', 'internet', 'mobile', 'recharge', 'subscription', 'fees'],
    Health: ['medicine', 'doctor', 'hospital', 'clinic', 'pharmacy', 'health', 'gym', 'workout', 'fitness', 'medical']
};

// Valid Streak Entry Types
export const VALID_STREAK_ENTRY_TYPES = new Set([
    'expense',
    'save_day'
]);


