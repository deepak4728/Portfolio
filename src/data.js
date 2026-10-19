const SHEET_ID = "e/2PACX-1vQLeY6fIQXDqb54z4MEodLxEslW2_Bu5N_xfNVpmP8J9ie5IDjCo-eNyonx3TxMB6x1cn9QX02_ToKR";
const tabs = {
  summary: 0,
  socialLinks: 546184029,
  projects: 2043840442,
  certificates: 682957323,
  skills: 405041665,
  education: 1434705904,
  workExperience: 1922006196,
  details: 851669658,
  positions: 1487468481,
};

function parseCSV(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (char === '"') {
      if (quoted && csv[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim()); value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (value || row.length) { row.push(value.trim()); if (row.some(Boolean)) rows.push(row); }
      row = []; value = "";
      if (char === "\r" && csv[i + 1] === "\n") i += 1;
    } else value += char;
  }
  if (value || row.length) { row.push(value.trim()); if (row.some(Boolean)) rows.push(row); }
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

async function readTab(name, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=${gid}&output=csv`;
  try {
    const response = await fetch(url, { headers: { Accept: "text/csv" } });
    if (!response.ok) throw new Error(`Sheet request failed (${response.status})`);
    return parseCSV(await response.text());
  } catch (error) {
    console.info(`Portfolio ${name} data is unavailable.`, error);
    return [];
  }
}

export async function loadPortfolio() {
  const names = Object.keys(tabs);
  const entries = await Promise.all(names.map(async (name) => [name, await readTab(name, tabs[name])]));
  return Object.fromEntries(entries);
}

export function field(row, ...keys) {
  for (const key of keys) if (row?.[key]?.trim()) return row[key].trim();
  return "";
}

export function imageUrl(url) {
  if (!url) return "";
  const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match && url.includes("drive.google.com") ? `https://lh3.googleusercontent.com/d/${match[1]}=w800` : url;
}
