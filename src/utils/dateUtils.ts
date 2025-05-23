/**
 * Formats a date to YYYY-MM-DD format without timezone issues
 * @param date The date to format
 * @param format Optional format string
 * @returns A formatted date string
 */
export const formatDate = (date: Date, format?: string): string => {
  if (format === "h:i K") {
    // Format for time in 12-hour format with AM/PM
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 24h to 12h format

    return `${hours12}:${minutes} ${period}`;
  }

  // Default YYYY-MM-DD format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Parses a date string in YYYY-MM-DD format to a Date object
 * @param dateString The date string to parse in YYYY-MM-DD format
 * @returns A Date object
 */
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();

  // Split the string into year, month, and day
  const [year, month, day] = dateString.split("-").map(Number);

  // Create a new date using local time (not UTC)
  return new Date(year, month - 1, day);
};

/**
 * Formats a date to a localized string based on the user's locale
 * @param date The date to format
 * @param options Optional Intl.DateTimeFormatOptions for custom formatting
 * @returns A localized date string
 */
export const formatLocalDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string => {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  return new Intl.DateTimeFormat(undefined, options).format(dateObj);
};
