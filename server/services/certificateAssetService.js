function asBuffer(v) {
  if (!v) return null;
  if (Buffer.isBuffer(v)) return v;
  if (v?.buffer && typeof v.position === 'number') {
    const raw = Buffer.isBuffer(v.buffer) ? v.buffer : Buffer.from(v.buffer);
    return raw.subarray(0, v.position);
  }
  if (typeof v.buffer !== 'undefined' && v.byteLength !== undefined) {
    return Buffer.from(v.buffer, v.byteOffset ?? 0, v.byteLength);
  }
  try {
    return Buffer.from(v);
  } catch {
    return null;
  }
}

function getProvider() {
  const value = String(process.env.CERT_IMAGE_PROVIDER || 'db').trim().toLowerCase();
  return value === 'cloudinary' ? 'cloudinary' : 'db';
}

function resolveCertificateImage(item = {}) {
  if (item.certificateImage?.length) {
    return {
      provider: 'db',
      mime: item.certificateImageMime || 'image/jpeg',
      buffer: asBuffer(item.certificateImage),
      url: null,
    };
  }
  const cloudUrl = item.certificateImageCloudinaryUrl || item.file;
  if (cloudUrl && /^https?:\/\//i.test(cloudUrl)) {
    return { provider: 'cloudinary', mime: null, buffer: null, url: cloudUrl };
  }
  return { provider: getProvider(), mime: null, buffer: null, url: null };
}

function sendImageBuffer(res, buf, mime) {
  const b = asBuffer(buf);
  if (!b || !b.length) return false;
  res.setHeader('Content-Type', String(mime || 'image/jpeg'));
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Content-Length', String(b.length));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.send(b);
  return true;
}

module.exports = {
  asBuffer,
  getProvider,
  resolveCertificateImage,
  sendImageBuffer,
};
