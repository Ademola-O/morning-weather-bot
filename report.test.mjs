// Tests for js/report.js
// Run them from the main folder with:  node --test
// (Needs Node.js 18 or newer. Nothing to install.)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
    parseReport,
    isCompleteReport,
    parseIsoDate,
    formatDate,
    ageInDays
} from "../js/report.js";

const SAMPLE = "# Morning weather report\nDate: 2026-11-25\nHigh: 6.3°C\nLow: 3.7°C\nRain: 0 mm\n";

test("parseReport reads all four values", () => {
    assert.deepEqual(parseReport(SAMPLE), {
        Date: "2026-11-25",
        High: "6.3°C",
        Low: "3.7°C",
        Rain: "0 mm"
    });
});

test("parseReport copes with Windows (CRLF) line endings", () => {
    const values = parseReport(SAMPLE.replace(/\n/g, "\r\n"));
    assert.equal(values.High, "6.3°C");
    assert.equal(values.Rain, "0 mm");
});

test("parseReport ignores lines it doesn't know", () => {
    const values = parseReport("hello\n" + SAMPLE + "Wind: 12 mph\n");
    assert.equal(Object.keys(values).length, 4);
});

test("parseReport handles empty or odd input without crashing", () => {
    assert.deepEqual(parseReport(""), {});
    assert.deepEqual(parseReport(undefined), {});
    assert.deepEqual(parseReport("High:\nLow:   \n"), {});
});

test("isCompleteReport needs all four values", () => {
    assert.equal(isCompleteReport(parseReport(SAMPLE)), true);
    assert.equal(isCompleteReport({ Date: "2026-11-25", High: "6°C", Low: "3°C" }), false);
    assert.equal(isCompleteReport({}), false);
});

test("parseIsoDate accepts real dates and rejects impossible ones", () => {
    const date = parseIsoDate("2026-11-25");
    assert.equal(date.getFullYear(), 2026);
    assert.equal(date.getMonth(), 10);   // months start at 0, so 10 is November
    assert.equal(date.getDate(), 25);

    assert.equal(parseIsoDate("2026-13-45"), null);
    assert.equal(parseIsoDate("2026-02-30"), null);
    assert.equal(parseIsoDate("25/11/2026"), null);
    assert.equal(parseIsoDate("tomorrow"), null);
    assert.equal(parseIsoDate(""), null);
});

test("formatDate shows a readable date and returns bad input unchanged", () => {
    const text = formatDate("2026-11-25");
    assert.match(text, /Wednesday/);
    assert.match(text, /25 November 2026/);
    assert.equal(formatDate("not a date"), "not a date");
});

test("ageInDays counts whole days", () => {
    const now = new Date(2026, 10, 27, 15, 30);   // 27 Nov 2026, 15:30
    assert.equal(ageInDays("2026-11-27", now), 0);
    assert.equal(ageInDays("2026-11-26", now), 1);
    assert.equal(ageInDays("2026-11-25", now), 2);
    assert.equal(ageInDays("2026-10-27", now), 31);
});

test("ageInDays gives the same answer early and late in the day", () => {
    assert.equal(ageInDays("2026-11-26", new Date(2026, 10, 27, 0, 1)), 1);
    assert.equal(ageInDays("2026-11-26", new Date(2026, 10, 27, 23, 59)), 1);
});

test("ageInDays is correct across the clocks changing", () => {
    // UK clocks went back on 25 Oct 2026, so that day has 25 hours
    assert.equal(ageInDays("2026-10-24", new Date(2026, 9, 26, 12, 0)), 2);
});

test("ageInDays returns null for an invalid date", () => {
    assert.equal(ageInDays("nope", new Date(2026, 10, 27)), null);
});
