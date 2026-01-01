const escpos = require('node-escpos');

// Choose the right connector for the printer configuration (USB, network, serial).
const connectPrinter = (printerConfig = {}) => {
  const { connection = {} } = printerConfig;

  switch (connection.kind) {
    case 'usb': {
      const { vendorId, productId } = connection;
      if (!vendorId || !productId) throw new Error('USB printers need vendorId and productId');
      return new escpos.USB(vendorId, productId);
    }
    case 'network': {
      const { host, port = 9100 } = connection;
      if (!host) throw new Error('Network printers need host/IP');
      return new escpos.Network(host, port);
    }
    case 'serial': {
      const { path, options = {} } = connection;
      if (!path) throw new Error('Serial printers need device path');
      return new escpos.Serial(path, options);
    }
    default:
      // Fallback to first detected USB printer.
      return new escpos.USB();
  }
};

const printEscpos = async ({ lines = [], encoding = 'utf8', imageBuffer }, printerConfig) => {
  const device = connectPrinter(printerConfig);
  const printer = new escpos.Printer(device, { encoding });

  return new Promise((resolve, reject) => {
    device.open((openError) => {
      if (openError) return reject(openError);

      if (imageBuffer) {
        escpos.Image.load(imageBuffer, (imageError, image) => {
          if (imageError) return reject(imageError);
          printer.align('ct').raster(image).cut().close();
          return resolve();
        });
      } else {
        lines.forEach((line) => printer.text(line));
        printer.cut().close();
        resolve();
      }
    });
  });
};

// Quick connectivity probe: try opening the device (and closing immediately).
const probePrinter = async (printerConfig) => {
  const device = connectPrinter(printerConfig);

  return new Promise((resolve, reject) => {
    device.open((openError) => {
      if (openError) return reject(openError);
      if (typeof device.close === 'function') {
        device.close();
      }
      resolve(true);
    });
  });
};

module.exports = { printEscpos, probePrinter };
