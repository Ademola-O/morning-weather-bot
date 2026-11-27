// =====================================================================
// report.js: THE REPORT LOGIC (no web page in here)
//
// Small functions that read the bot's report text, check it, and format it.
// None of them touch the page (there is no document.getElementById in this
// file), which is a best practice because:
//   1. They can be tested on their own (see tests/report.test.mjs).
//   2. If the page's design changes, this logic can't break.
//
// main.js imports these functions and connects them to the page.
// =====================================================================

// The four values the bot writes into weather.md
const REQUIRED_FIELDS = ["Date", "High", "Low", "Rain"];

// Reads the report text line by line and picks out "Date:", "High:", "Low:" and "Rain:".
// Returns an object like { Date: "2026-11-25", High: "6.3°C", Low: "3.7°C", Rain: "0 mm" }.
// Lines that don't match are ignored, so extra lines in the file do no harm.
export function parseReport(text) {
    const values = {};

    // /\r?\n/ splits on both Unix (\n) and Windows (\r\n) line endings
    for (const line of String(text).split(/\r?\n/)) {
        const match = line.match(/^(Date|High|Low|Rain):\s*(.+)$/);
        if (match) {
            // trim() removes spaces at each end. A value that is only spaces
            // becomes empty, and is skipped so it can't count as a real value.
            const value = match[2].trim();
            if (value !== "") {
                values[match[1]] = value;
            }
        }
    }

    return values;
}

// True only if all four values were found
export function isCompleteReport(values) {
    return REQUIRED_FIELDS.every(function (field) {
        return Boolean(values[field]);
    });
}

// Turns "2026-11-25" into a local Date, or null if it isn't a real date.
// new Date(year, month - 1, day) is used instead of new Date("2026-11-25"),
// because the second form is read as UTC and can show the wrong day.
export function parseIsoDate(isoDate) {
    const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    // JavaScript quietly "fixes" impossible dates (month 13 becomes January of
    // the next year), so check the date still has the numbers we gave it.
    const isRealDate =
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;

    return isRealDate ? date : null;
}

// "2026-11-25" -> something like "Wednesday 25 November 2026".
// If the text isn't a valid date, it is returned unchanged.
export function formatDate(isoDate) {
    const date = parseIsoDate(isoDate);
    if (!date) return isoDate;

    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// How many whole days old the report is, compared with `now`.
// Returns null if the date isn't valid. `now` is a parameter so tests can pass a fixed date.
export function ageInDays(isoDate, now = new Date()) {
    const reportDate = parseIsoDate(isoDate);
    if (!reportDate) return null;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Math.round absorbs the 23- and 25-hour days when the clocks change
    return Math.round((today - reportDate) / 86400000);
}
