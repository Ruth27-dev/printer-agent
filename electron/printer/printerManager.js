const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { printEscpos, probePrinter } = require('./escposPrinter');
const { renderImageToBuffer } = require('./imagePrinter');
const { withFailover } = require('./failover');
const { createUsbPrinter, createNetworkPrinter } = require('./printerFactory');
const { fetchPrintersFromApi } = require('./apiClient');

const prefsPath = app ? path.join(app.getPath('userData'), 'printers.json') : null;

const loadPreferences = () => {
  if (!prefsPath) return {};
  try {
    return JSON.parse(fs.readFileSync(prefsPath, 'utf8'));
  } catch (error) {
    return {};
  }
};

const savePreferences = (payload) => {
  if (!prefsPath) return;
  try {
    const existing = loadPreferences();
    fs.writeFileSync(prefsPath, JSON.stringify({ ...existing, ...payload }, null, 2));
  } catch (error) {
    console.warn('Failed to persist printer preferences', error.message);
  }
};

// Configure your printers here. Add vendor/product IDs for USB printers and
// host/port for networked printers.
const printers = [
  createUsbPrinter({
    id: 'front-usb',
    name: 'Front Counter (USB)',
    vendorId: 0x0416,
    productId: 0x5011, // replace with your VID/PID
  }),
  createNetworkPrinter({
    id: 'kitchen-lan',
    name: 'Kitchen (Network)',
    host: '192.168.1.50',
    port: 9100, // replace with your IP/port
  }),
];

const initialPrefs = loadPreferences();
let defaultPrinterId = initialPrefs.defaultPrinterId || printers[0].id;
// Map categories to printer IDs for kitchen/bar/etc routing.
const categoryRoutes = {
  kitchen: 'kitchen-lan',
  bar: 'front-usb',
};

const findPrinter = (printerId) => printers.find((printer) => printer.id === printerId);

const printerOrder = (preferredId) => {
  const primaryId = preferredId || defaultPrinterId;
  return [
    primaryId,
    ...printers.filter((printer) => printer.id !== primaryId).map((printer) => printer.id),
  ];
};

const initializePrinterManager = async () => {
  try {
    const remotePrinters = await fetchPrintersFromApi();
    if (Array.isArray(remotePrinters) && remotePrinters.length > 0) {
      printers.splice(0, printers.length, ...remotePrinters);
      defaultPrinterId = remotePrinters[0].id;
    }
  } catch (error) {
    console.warn('Failed to load printers from API, using local config.', error.message);
  }

  const remoteDefault = initialPrefs.defaultPrinterId;
  const initialDefaultCandidate = remoteDefault || defaultPrinterId;
  if (findPrinter(initialDefaultCandidate)) {
    defaultPrinterId = initialDefaultCandidate;
  }

  return {
    printers,
    defaultPrinter: defaultPrinterId,
  };
};

const getPrinters = () => ({
  printers,
  defaultPrinter: defaultPrinterId,
});

const setDefaultPrinter = (printerId) => {
  if (!findPrinter(printerId)) {
    throw new Error(`Printer ${printerId} does not exist`);
  }
  defaultPrinterId = printerId;
  savePreferences({ defaultPrinterId });
  return { defaultPrinter: defaultPrinterId };
};

const deletePrinter = (printerId) => {
  const index = printers.findIndex((printer) => printer.id === printerId);
  if (index === -1) throw new Error(`Printer ${printerId} does not exist`);
  printers.splice(index, 1);
  if (defaultPrinterId === printerId) {
    defaultPrinterId = printers[0]?.id;
    savePreferences({ defaultPrinterId });
  }
  return { printers, defaultPrinter: defaultPrinterId };
};

const printReceipt = async ({ lines = [], printerId, encoding = 'utf8' }) => {
  const targets = printerOrder(printerId);
  return withFailover(targets, async (targetPrinterId) => {
    const printer = findPrinter(targetPrinterId);
    if (!printer) throw new Error(`Printer ${targetPrinterId} not found`);
    await printEscpos({ lines, encoding }, printer);
    return { printerId: targetPrinterId };
  });
};

const printImageFromBuffer = async ({ image, printerId, width }) => {
  const targets = printerOrder(printerId);
  const buffer = await renderImageToBuffer(image, width);
  return withFailover(targets, async (targetPrinterId) => {
    const printer = findPrinter(targetPrinterId);
    if (!printer) throw new Error(`Printer ${targetPrinterId} not found`);
    await printEscpos({ imageBuffer: buffer }, printer);
    return { printerId: targetPrinterId };
  });
};

const checkPrinterStatus = async (printerId) => {
  const printer = findPrinter(printerId);
  if (!printer) throw new Error(`Printer ${printerId} not found`);
  try {
    await probePrinter(printer);
    return { printerId, ok: true };
  } catch (error) {
    return { printerId, ok: false, error: error.message };
  }
};

// Print a bill by splitting items per category and routing to the assigned printer.
// items: [{ name, qty, price, category }]
const printBillByCategory = async ({ items = [] }) => {
  const grouped = items.reduce((acc, item) => {
    const key = item.category || 'default';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const results = [];
  for (const [category, categoryItems] of Object.entries(grouped)) {
    const printerId = categoryRoutes[category] || defaultPrinterId;
    const lines = [
      `Category: ${category}`,
      '--------------------',
      ...categoryItems.map((i) => `${i.qty} x ${i.name}`),
      ' ',
    ];
    const printResult = await printReceipt({ lines, printerId });
    results.push({ category, printerId: printResult.printerId });
  }
  return results;
};

module.exports = {
  initializePrinterManager,
  getPrinters,
  setDefaultPrinter,
  deletePrinter,
  printReceipt,
  printImageFromBuffer,
  printBillByCategory,
  checkPrinterStatus,
};
