// =====================================================================
// main.js: CONNECTS THE REPORT TO THE PAGE
//
// The bot (weather.js, run by GitHub Actions) saves its report in weather.md.
// This file fetches that file, uses the functions in report.js to read it,
// and puts the numbers on the page. The page always matches the latest report
// without anyone editing it by hand.
//
// Note: fetch() needs the page to be served by a web server. It works on GitHub
// Pages and with the VS Code Live Server extension, but not if you open
// index.html by double-clicking it.
// =====================================================================

import { parseReport, isCompleteReport, formatDate, ageInDays } from "./report.js";

// The report file. A relative address like this is worked out from the PAGE
// (index.html), not from this script, so it points at weather.md in the main folder.
const REPORT_URL = "weather.md";

// If the report is this many days old, tell the visitor it may be out of date
const STALE_AFTER_DAYS = 2;

// Finds an element by id. If the id is missing from index.html, it throws a
// clear error straight away instead of a confusing one later.
function byId(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error('Missing element in index.html: id="' + id + '"');
    }
    return element;
}

const elements = {
    date: byId("date"),
    high: byId("high"),
    low: byId("low"),
    rain: byId("rain"),
    status: byId("status")
};

// Fetches the report, checks it, and fills in the page.
// async/await lets us wait for the reply without freezing the page.
async function loadReport() {
    try {
        // cache: "no-store" asks the browser for a fresh copy, not an old saved one
        const response = await fetch(REPORT_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status);

        const values = parseReport(await response.text());

        // Make sure all four values were found before showing anything
        if (!isCompleteReport(values)) {
            throw new Error("Report format not recognised");
        }

        // textContent puts the text in as plain text, never as HTML
        elements.date.textContent = formatDate(values.Date);
        elements.high.textContent = values.High;
        elements.low.textContent = values.Low;
        elements.rain.textContent = values.Rain;

        // Be honest if the data is old, for example if the bot has stopped running
        const age = ageInDays(values.Date);
        if (age !== null && age >= STALE_AFTER_DAYS) {
            elements.status.textContent =
                "This report is " + age + " days old, so the bot may not have run recently.";
        }

    } catch (error) {
        elements.date.textContent = "No report available";
        elements.status.textContent = "Couldn't load the latest report. Please try again later.";
        console.error(error);
    }
}

// Start as soon as the script runs. Module scripts wait for the page to be
// ready automatically, so the elements above already exist.
loadReport();
