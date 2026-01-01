const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { startWebsocketServer } = require('../websocket/server');
const {
  initializePrinterManager,
  getPrinters,
  setDefaultPrinter,
  deletePrinter,
  printReceipt,
  printImageFromBuffer,
  checkPrinterStatus,
} = require('./printer/printerManager');
const { checkForUpdate, downloadAndRunInstaller } = require('./update/updateManager');

const isDev = process.env.NODE_ENV === 'development';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

let staticServer;
let staticServerUrl;

const startStaticFileServer = async () => {
  if (staticServerUrl) return staticServerUrl;

  const rootDir = path.join(__dirname, '../next/out');

  staticServer = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, 'http://localhost');
      const safePath = decodeURIComponent(requestUrl.pathname.replace(/^\/+/, ''));
      const resolvedPath = path.resolve(rootDir, safePath || '.');

      if (!resolvedPath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      const tryPaths = [resolvedPath];
      tryPaths.push(`${resolvedPath}.html`);
      if (!safePath || requestUrl.pathname.endsWith('/')) {
        tryPaths.unshift(path.join(rootDir, safePath, 'index.html'));
      } else {
        tryPaths.push(path.join(resolvedPath, 'index.html'));
      }

      let foundPath;
      for (const candidate of tryPaths) {
        try {
          const stat = await fs.promises.stat(candidate);
          if (stat.isFile()) {
            foundPath = candidate;
            break;
          }
        } catch (error) {
          // Ignore missing candidates; fall through to next option.
        }
      }

      if (!foundPath) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(foundPath).toLowerCase();
      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      const content = await fs.promises.readFile(foundPath);
      res.writeHead(200);
      res.end(content);
    } catch (error) {
      console.error('Static file server error', error);
      res.writeHead(500);
      res.end('Server error');
    }
  });

  await new Promise((resolve) => staticServer.listen(0, '127.0.0.1', resolve));
  const { port } = staticServer.address();
  staticServerUrl = `http://127.0.0.1:${port}`;
  return staticServerUrl;
};

const resolveUiUrl = async () => {
  if (process.env.UI_URL) return process.env.UI_URL;
  if (isDev) return 'http://localhost:3000';

  const builtIndex = path.join(__dirname, '../next/out/index.html');
  if (fs.existsSync(builtIndex)) {
    return startStaticFileServer();
  }

  return null;
};

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const uiUrl = await resolveUiUrl();
  if (uiUrl) {
    mainWindow.loadURL(uiUrl).catch((error) => {
      console.error('Failed to load UI, falling back to placeholder.', error);
      mainWindow.loadURL('data:text/html,<h1>UI not running</h1><p>Start Next dev server on http://localhost:3000 or set UI_URL.</p>');
    });
  } else {
    mainWindow.loadURL('data:text/html,<h1>UI not found</h1><p>Run Next with `npm run dev:next` or build it into next/out.</p>');
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

const registerIpcHandlers = () => {
  ipcMain.handle('printers:list', () => getPrinters());
  ipcMain.handle('printers:set-default', (_event, printerId) => setDefaultPrinter(printerId));
  ipcMain.handle('printers:delete', (_event, printerId) => deletePrinter(printerId));
  ipcMain.handle('printers:print-receipt', (_event, payload) => printReceipt(payload));
  ipcMain.handle('printers:print-image', (_event, payload) => printImageFromBuffer(payload));
  ipcMain.handle('printers:status', (_event, printerId) => checkPrinterStatus(printerId));
  ipcMain.handle('update:check', () => checkForUpdate());
  ipcMain.handle('update:run', (_event, downloadUrl) => downloadAndRunInstaller(downloadUrl));
};

app.whenReady().then(async () => {
  registerIpcHandlers();
  await initializePrinterManager();
  startWebsocketServer();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (staticServer) {
    staticServer.close();
  }
});
