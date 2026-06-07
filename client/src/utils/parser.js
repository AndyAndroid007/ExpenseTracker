export function parseInput(text) {
  const lower = text.toLowerCase().trim();

  if (/no[\s-]?spend|zero spend|didn.?t spend|nothing today/.test(lower))
    return { type: 'no_spend', amount: null, category: null };

  if (/saved (today|money)|saving day|no expense/.test(lower))
    return { type: 'save_day', amount: null, category: null };

  const amountMatch = lower.match(/(?:₹|rs\.?\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  const categoryMap = {
    Food: ['food','lunch','dinner','breakfast','swiggy','zomato','blinkit','zepto','chai','coffee','restaurant','groceries','snack'],
    Transport: ['uber','ola','auto','metro','bus','rapido','petrol','cab','namma','toll'],
    Shopping: ['amazon','flipkart','myntra','clothes','shopping','shirt','shoes'],
    Entertainment: ['movie','netflix','spotify','prime','hotstar','concert','pub','bar'],
    Bills: ['rent','electricity','wifi','internet','recharge','emi','bill'],
    Health: ['medicine','doctor','hospital','gym','pharmacy','chemist'],
  };

  let category = 'General';
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(k => lower.includes(k))) { category = cat; break; }
  }

  const dateLabel = lower.includes('yesterday') ? 'Yesterday' : 'Today';
  const confidence = amount && !lower.includes('around') ? 'high' : amount ? 'medium' : 'low';

  return { type: 'expense', amount, category, dateLabel, confidence };
}
