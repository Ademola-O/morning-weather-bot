// weather.js
// Fetches today's weather forecast for London from a free API
// and saves it as a short report in weather.md.

// The location we want the forecast for (London's coordinates)
const LAT = 51.5072;
const LON = -0.1276;

// How long to wait for the API before giving up (10 seconds).
// Without a limit, a slow server could leave the script hanging forever.
const TIMEOUT_MS = 10000;

// The web address we'll ask for data.
// The API's address plus "query parameters" describing what we want:
// - latitude and longitude: the location
// - daily=...: the daily values we want (highest temp, lowest temp, total rain)
// - timezone: so "today" means today in London
// - forecast_days=1: only today
const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
  `&timezone=Europe/London&forecast_days=1`;

// Node's built-in file system module, used at the end to save the report.
const fs = require("fs");

// "async" functions are designed to handle asynchronous operations,
// like fetching data from an API, where we have to wait for a reply.
async function main() {
  // Send the request and wait for the reply.
  // AbortSignal.timeout() cancels the request if it takes longer than TIMEOUT_MS.
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });

  // If the API returned an error (anything other than a success code),
  // stop here with a clear message so the problem isn't hidden.
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  // Convert the reply from JSON (text) into a JavaScript object we can use.
  const data = await res.json();
  const d = data.daily;

  // Check the reply has the shape we expect before using it.
  // If the API ever changes, this gives a clear error instead of a confusing crash.
  if (!d || !d.time || !d.temperature_2m_max || !d.temperature_2m_min || !d.precipitation_sum) {
    throw new Error("Unexpected API response: daily forecast data is missing");
  }

  // Build the report as text. Each ${...} is replaced with a real value.
  const report = `# Morning weather report
Date: ${d.time[0]}
High: ${d.temperature_2m_max[0]}°C
Low: ${d.temperature_2m_min[0]}°C
Rain: ${d.precipitation_sum[0]} mm
`;

  // Save the report to a file called weather.md.
  fs.writeFileSync("weather.md", report);
  console.log(report);
}

// Run the main function. If anything inside it fails, ".catch" handles it:
// print the error, then exit with code 1. A non-zero exit code is what makes
// the GitHub Actions run show a red cross, so a failure is never silent.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
