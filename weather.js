// weather.js
// Fetches todays weather forcast for London from a free API
// and saves it as a short repoty in weather.md.

// Tho location we want the forecast for (London's coordinates)
const LAT = 51.5072; 
const LON = -0.1276;

// The web address we'll ask for data
// The API.s address plus "query parameter" highlighting what we want:
// - lattitude and longitude: location 
// - daily=...: the daily values we want (highest temp, lowest temp, total rain)
// - timezone: so "today" is specific to today in London.
// - forecast_days=1: only today
const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` + 
  `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
  `&timezone=Europe/London&forecast_days=1`; // request to a free weather API

// "async" functions designed to handle asynchronous operations like fetching data from APIs
async function main() {
  // Send request and wait for reply   
  const res = await fetch(url);

  // If the API returned an error (anything other than a success code),
  // stop here with a clear message so the problem isn't hidden.
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  // Convert the reply from JSON (text) into a JavaScript object we can use.
  const data = await res.json();
  const d = data.daily;
  
  // Build the report as text. Each ${...} is replaced with a real value.
  const report = `# Morning weather report
Date: ${d.time[0]}
High: ${d.temperature_2m_max[0]}°C
Low: ${d.temperature_2m_min[0]}°C
Rain: ${d.precipitation_sum[0]} mm
`;
  
  // Save the report to a file called weather.md.
  require("fs").writeFileSync("weather.md", report);
  console.log(report);
}

// Run the main function. If anything inside it fails, ".catch" handles it:
main().catch((err) => {
  console.error(err); 
  process.exit(1);
});