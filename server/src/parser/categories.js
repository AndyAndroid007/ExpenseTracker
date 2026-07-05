export const CATEGORY_KEYWORDS = {
    Food: ['food', 'lunch', 'dinner', 'breakfast', 'zomato', 'swiggy', 'restaurant', 'cafe', 'coffee', 'starbucks', 'grocery', 'groceries', 'tea', 'snack', 'snacks', 'eat', 'burger', 'pizza', 'biryani', 'mcdonalds', 'kfc', 'subway', 'dominos', 'dining', 'bakery'],
    Transport: ['uber', 'ola', 'metro', 'bus', 'auto', 'petrol', 'transport', 'cab', 'taxi', 'train', 'flight', 'diesel', 'fuel', 'fare', 'ride'],
    Shopping: ['amazon', 'flipkart', 'shopping', 'clothes', 'mall', 'purchase', 'buy', 'gift', 'shoes', 'gadget', 'device'],
    Entertainment: ['movie', 'netflix', 'spotify', 'outing', 'cinema', 'concert', 'bar', 'pub', 'club', 'game', 'gaming', 'show', 'ticket', 'party', 'drinks'],
    Bills: ['rent', 'electricity', 'wifi', 'bill', 'water', 'gas', 'internet', 'mobile', 'recharge', 'subscription', 'fees'],
    Health: ['medicine', 'doctor', 'hospital', 'clinic', 'pharmacy', 'health', 'gym', 'workout', 'fitness', 'medical']
};

/**
 * Extracts and maps a category from conversational text based on keywords.
 * 
 * @param {string} text - Normalized raw text
 * @returns {string} The matched category, or "General" as a fallback
 */
export const extractCategory = (text) => {
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(text)) {
                return category;
            }
        }
    }
    return 'General';
};
