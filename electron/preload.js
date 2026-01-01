const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload);

contextBridge.exposeInMainWorld('printerAPI', {
  listPrinters: () => invoke('printers:list'),
  setDefaultPrinter: (printerId) => invoke('printers:set-default', printerId),
  deletePrinter: (printerId) => invoke('printers:delete', printerId),
  printReceipt: (payload) => invoke('printers:print-receipt', payload),
  printImage: (payload) => invoke('printers:print-image', payload),
  checkStatus: (printerId) => invoke('printers:status', printerId),
});

contextBridge.exposeInMainWorld('updateAPI', {
  check: () => invoke('update:check'),
  run: (downloadUrl) => invoke('update:run', downloadUrl),
});
