/**
 * Calculates the YYYY-MM-DD date in the user's local timezone.
 * 
 * @param {number} timezoneOffsetMinutes - User's timezone offset in minutes (e.g. -330 for IST)
 * @param {number} relativeDays - Days to add or subtract (e.g. -1 for yesterday)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getLocalDateString = (timezoneOffsetMinutes = 0, relativeDays = 0) => {
    const utcNow = new Date();
    // Adjust UTC to user's local time (JS timezone offset is negative for positive zones like IST)
    const userLocalTime = new Date(utcNow.getTime() - (timezoneOffsetMinutes * 60 * 1000));
    // Adjust relative days
    userLocalTime.setDate(userLocalTime.getDate() + relativeDays);
    
    const yyyy = userLocalTime.getFullYear();
    const mm = String(userLocalTime.getMonth() + 1).padStart(2, '0');
    const dd = String(userLocalTime.getDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
};

const WEEKDAYS = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
};

/**
 * Parses conversational date hints (e.g. "yesterday", "monday") into a YYYY-MM-DD date.
 * 
 * @param {string} text - Normalized raw text
 * @param {number} timezoneOffsetMinutes - Timezone offset in minutes
 * @returns {{ date: string, explicit: boolean }} Resolved date and whether it was explicitly mentioned
 */
export const parseExpenseDate = (text, timezoneOffsetMinutes = 0) => {
    // 1. Explicit yesterday
    if (/\byesterday\b/i.test(text)) {
        return { date: getLocalDateString(timezoneOffsetMinutes, -1), explicit: true };
    }
    
    // 2. Explicit tomorrow (useful for logging forward transactions)
    if (/\btomorrow\b/i.test(text)) {
        return { date: getLocalDateString(timezoneOffsetMinutes, 1), explicit: true };
    }
    
    // 3. Explicit today
    if (/\btoday\b/i.test(text)) {
        return { date: getLocalDateString(timezoneOffsetMinutes, 0), explicit: true };
    }

    // 4. Relative past days (e.g. "2 days ago", "3 days back", "before 2 days", "2 days before")
    const daysBeforeMatch = text.match(/\b(?:before\s+(\d+)\s+days?|(\d+)\s+days?\s+(?:ago|back|before))\b/i);
    if (daysBeforeMatch) {
        const days = parseInt(daysBeforeMatch[1] || daysBeforeMatch[2], 10);
        return { date: getLocalDateString(timezoneOffsetMinutes, -days), explicit: true };
    }

    // 5. Relative future days (e.g. "1 day after", "2 days later", "after 1 day")
    const daysAfterMatch = text.match(/\b(?:after\s+(\d+)\s+days?|(\d+)\s+days?\s+(?:later|after))\b/i);
    if (daysAfterMatch) {
        const days = parseInt(daysAfterMatch[1] || daysAfterMatch[2], 10);
        return { date: getLocalDateString(timezoneOffsetMinutes, days), explicit: true };
    }

    // 6. Weekdays (find the most recent occurrence of this weekday in the past)
    for (const [dayName, dayIndex] of Object.entries(WEEKDAYS)) {
        if (new RegExp(`\\b${dayName}\\b`, 'i').test(text)) {
            const utcNow = new Date();
            const localTime = new Date(utcNow.getTime() - (timezoneOffsetMinutes * 60 * 1000));
            const currentDayIndex = localTime.getDay();
            
            // Calculate distance to the most recent weekday in the past
            let diff = currentDayIndex - dayIndex;
            if (diff <= 0) {
                diff += 7; 
            }
            
            return { date: getLocalDateString(timezoneOffsetMinutes, -diff), explicit: true };
        }
    }

    // 5. Default fallback to today
    return { date: getLocalDateString(timezoneOffsetMinutes, 0), explicit: false };
};
