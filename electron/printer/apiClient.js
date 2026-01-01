const API_BASE = process.env.PRINTER_API_BASE || 'https://admin.foodmonster.asia/api';

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const fetchPrintersFromApi = async () => {
  // Expects API to return an array of printers: [{ id, name, type, connection? }]
  const url = `${API_BASE}/printers`;
  return fetchJson(url);
};

module.exports = { fetchPrintersFromApi, API_BASE };
