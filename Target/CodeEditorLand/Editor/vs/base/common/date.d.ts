/**
 * Create a localized difference of the time between now and the specified date.
 * @param date The date to generate the difference from.
 * @param appendAgoLabel Whether to append the " ago" to the end.
 * @param useFullTimeWords Whether to use full words (eg. seconds) instead of
 * shortened (eg. secs).
 * @param disallowNow Whether to disallow the string "now" when the difference
 * is less than 30 seconds.
 */
export declare function fromNow(date: number | Date, appendAgoLabel?: boolean, useFullTimeWords?: boolean, disallowNow?: boolean): string;
export declare function fromNowByDay(date: number | Date, appendAgoLabel?: boolean, useFullTimeWords?: boolean): string;
/**
 * Gets a readable duration with intelligent/lossy precision. For example "40ms" or "3.040s")
 * @param ms The duration to get in milliseconds.
 * @param useFullTimeWords Whether to use full words (eg. seconds) instead of
 * shortened (eg. secs).
 */
export declare function getDurationString(ms: number, useFullTimeWords?: boolean): string;
export declare function toLocalISOString(date: Date): string;
