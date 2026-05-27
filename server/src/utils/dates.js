/**
 * Formats a Date object to YYYY-MM-DD in UTC.
 * 
 * @param {Date} date 
 * @returns {string} e.g. "2026-05-27"
 */
export const toIsoDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Returns YYYY-MM-DD formatted date in user's timezone using IANA timezone identifier.
 * Leverages the 'en-CA' locale which natively outputs in YYYY-MM-DD.
 * 
 * @param {Date} date 
 * @param {string} timeZone e.g. "Asia/Kolkata"
 * @returns {string} e.g. "2026-05-27"
 */
export const getDateByTimeZone = (date, timeZone) => {
    try {
        return date.toLocaleDateString('en-CA', { timeZone });
    } catch (error) {
        // Fallback to UTC if timezone is invalid or unsupported
        return toIsoDate(date);
    }
};

/**
 * Adjusts UTC Date to user's local timezone using timezone offset in minutes.
 * Follows JS native timezone offset convention (negative offset for positive zones like IST: -330)
 * 
 * @param {Date} date 
 * @param {number} offsetMinutes e.g. -330 for IST
 * @returns {string} YYYY-MM-DD
 */
export const getDateByOffsetMinutes = (date, offsetMinutes) => {
    const shiftedDate = new Date(date.getTime() - (offsetMinutes * 60 * 1000));
    return toIsoDate(shiftedDate);
};

/**
 * Parses numeric or string offset value into integer minutes.
 * Supports standard integer string offsets (e.g., "-330").
 * 
 * @param {string|number} offset 
 * @returns {number|null} parsed minutes or null if invalid
 */
export const parseOffsetToMinutes = (offset) => {
    if (offset === undefined || offset === null) {
        return null;
    }

    const parsed = Number(offset);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

/**
 * Core resolver that retrieves the YYYY-MM-DD date in the user's zone.
 * 
 * @param {object} params
 * @param {Date} [params.date=new Date()]
 * @param {string} [params.timezone] IANA timezone string e.g. "Asia/Kolkata"
 * @param {string|number} [params.timezoneOffsetMinutes] e.g. -330
 * @returns {string} YYYY-MM-DD
 */
export const getTodayInUserZone = ({ date = new Date(), timezone, timezoneOffsetMinutes } = {}) => {
    const parsedOffset = parseOffsetToMinutes(timezoneOffsetMinutes);

    if (parsedOffset !== null) {
        return getDateByOffsetMinutes(date, parsedOffset);
    }

    if (timezone) {
        return getDateByTimeZone(date, timezone);
    }

    return toIsoDate(date);
};

/**
 * Returns the day before the provided ISO date.
 * 
 * @param {string} isoDate YYYY-MM-DD
 * @returns {string} YYYY-MM-DD
 */
export const getPreviousDate = (isoDate) => {
    const previous = new Date(`${isoDate}T00:00:00.000Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    return toIsoDate(previous);
};
