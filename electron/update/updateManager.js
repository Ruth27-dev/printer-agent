const { app, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const http = require('node:http');
const https = require('node:https');

const UPDATE_MANIFEST_URL =
  process.env.UPDATE_MANIFEST_URL || 'https://admin.foodmonster.asia/api/printer-agent/latest.json';

const fetchJson = async (url) =>
  new Promise((resolve, reject) => {
    const handler = (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`Update manifest request failed: ${res.statusCode}`));
        return;
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(Buffer.concat(data).toString('utf8'));
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
    };

    const client = url.startsWith('https') ? https : http;
    client
      .get(url, handler)
      .on('error', reject);
  });

const compareVersions = (a, b) => {
  const pa = a.split('.').map((n) => parseInt(n, 10));
  const pb = b.split('.').map((n) => parseInt(n, 10));
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};

const checkForUpdate = async () => {
  const manifest = await fetchJson(UPDATE_MANIFEST_URL);
  const latestVersion = manifest.version || manifest.latest || '';
  const downloadUrl = manifest.url || manifest.downloadUrl;

  if (!latestVersion || !downloadUrl) {
    throw new Error('Update manifest missing version or url');
  }

  const currentVersion = app.getVersion();
  const updateAvailable = compareVersions(latestVersion, currentVersion) > 0;

  return {
    updateAvailable,
    currentVersion,
    latestVersion,
    downloadUrl,
    notes: manifest.notes,
  };
};

const downloadUpdate = async (downloadUrl) => {
  const targetDir = await fs.promises.mkdtemp(path.join(app.getPath('temp'), 'printer-agent-update-'));
  const fileName = path.basename(new URL(downloadUrl).pathname);
  const targetPath = path.join(targetDir, fileName);

  const client = downloadUrl.startsWith('https') ? https : http;

  await new Promise((resolve, reject) => {
    client
      .get(downloadUrl, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }
        pipeline(res, fs.createWriteStream(targetPath)).then(resolve).catch(reject);
      })
      .on('error', reject);
  });

  return targetPath;
};

const downloadAndRunInstaller = async (downloadUrl) => {
  const installerPath = await downloadUpdate(downloadUrl);
  await shell.openPath(installerPath);
  return installerPath;
};

module.exports = {
  checkForUpdate,
  downloadAndRunInstaller,
};
