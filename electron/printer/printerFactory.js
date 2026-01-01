const assertRequired = (value, label) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${label} is required`);
  }
};

const createPrinter = ({ id, name, type = 'escpos', connection }) => {
  assertRequired(id, 'Printer id');
  assertRequired(name, 'Printer name');
  assertRequired(connection, 'Printer connection');

  return { id, name, type, connection };
};

const createUsbPrinter = ({ id, name, vendorId, productId }) =>
  createPrinter({
    id,
    name,
    type: 'escpos',
    connection: { kind: 'usb', vendorId, productId },
  });

const createNetworkPrinter = ({ id, name, host, port = 9100 }) =>
  createPrinter({
    id,
    name,
    type: 'escpos',
    connection: { kind: 'network', host, port },
  });

const createSerialPrinter = ({ id, name, path, options = {} }) =>
  createPrinter({
    id,
    name,
    type: 'escpos',
    connection: { kind: 'serial', path, options },
  });

module.exports = {
  createPrinter,
  createUsbPrinter,
  createNetworkPrinter,
  createSerialPrinter,
};
