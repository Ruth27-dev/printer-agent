const withFailover = async (printerIds, attempt) => {
  let lastError;
  for (const printerId of printerIds) {
    try {
      return await attempt(printerId);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No printers available');
};

module.exports = { withFailover };
