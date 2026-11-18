// weather.js
const LAT = 51.5072; // London
const LON = -0.1276;

const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
  `&timezone=Europe/London&forecast_days=1`;

async function main() {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  const d = data.daily;

  const report = `# Morning weather report
Date: ${d.time[0]}
High: ${d.temperature_2m_max[0]}°C
Low: ${d.temperature_2m_min[0]}°C
Rain: ${d.precipitation_sum[0]} mm
`;

  require("fs").writeFileSync("weather.md", report);
  console.log(report);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});