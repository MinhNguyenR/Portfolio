import { useMemo } from 'react';
import { useCertificateProtection } from '../../hooks/useCertificateProtection';

function resolveImageSrc(file, slug) {
  if (file && (file.startsWith('/api/') || file.startsWith('http'))) return file;
  if (slug) return `/api/content/certificate-image/${slug}`;
  return null;
}

export default function CertificateImageEmbed({ file, slug, title = 'Certificate' }) {
  const src = resolveImageSrc(file, slug);
  const { blocked, watermarkText, protectionClassName, suppressContextMenu } = useCertificateProtection(src);
  const watermarkTiles = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  if (!src) return null;
  return (
    <div className={`certificate-pdf-embed ${protectionClassName}`} onContextMenu={suppressContextMenu}>
      <img src={src} alt={title} className="certificate-pdf-frame" draggable={false} />
      <div className="certificate-watermark-layer" aria-hidden>
        {watermarkTiles.map((i) => (
          <span key={i} className="certificate-watermark-tile">{watermarkText}</span>
        ))}
      </div>
      {blocked && (
        <div className="certificate-protection-layer" role="status" aria-live="polite">
          <span>Certificate is hidden while tab is unfocused.</span>
        </div>
      )}
    </div>
  );
}

export { resolveImageSrc };
