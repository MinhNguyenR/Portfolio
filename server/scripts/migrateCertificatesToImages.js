require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const contentRepository = require('../repositories/contentRepository');

const CERTS_DIR = path.resolve(__dirname, '../../../Certificates');

function mimeFromFilename(filename) {
  const lower = String(filename || '').toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

function readImage(filename) {
  const p = path.join(CERTS_DIR, filename);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const mappings = [
    { slug: 'mindx-fullstack', filename: 'mindx.jpg' },
    { slug: 'cole-ai-engineer', filename: 'cole.jpg' },
  ];

  for (const mapping of mappings) {
    const buffer = readImage(mapping.filename);
    if (!buffer) {
      console.warn(`Missing certificate image: ${mapping.filename}`);
      continue;
    }
    await contentRepository.updateMany(
      { type: 'certificate', slug: mapping.slug },
      {
        $set: {
          certificateImage: buffer,
          certificateImageName: mapping.filename,
          certificateImageMime: mimeFromFilename(mapping.filename),
          certificateImageProvider: 'db',
          certificateImageCloudinaryUrl: '',
          certificateImageCloudinaryPublicId: '',
          file: `/api/content/certificate-image/${mapping.slug}`,
        },
        $unset: {
          certificatePdf: '',
          hasEmbeddedPdf: '',
          certificateFilename: '',
        },
      }
    );
  }

  await contentRepository.updateMany(
    { type: 'certificate' },
    {
      $unset: {
        certificatePdf: '',
        hasEmbeddedPdf: '',
        certificateFilename: '',
      },
    }
  );

  await mongoose.disconnect();
  console.log('Certificate image migration completed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
