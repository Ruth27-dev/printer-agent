const renderImageToBuffer = async (imageInput, width = 500) => {
  if (!imageInput) throw new Error('No image provided');

  const source =
    typeof imageInput === 'string' && imageInput.startsWith('data:')
      ? imageInput.split(',')[1]
      : imageInput;

  // Return raw buffer (already base64 or Buffer). If you need resizing/grayscale,
  // handle it upstream or swap in an image processor library.
  return Buffer.isBuffer(source) ? source : Buffer.from(source, 'base64');
};

module.exports = { renderImageToBuffer };
