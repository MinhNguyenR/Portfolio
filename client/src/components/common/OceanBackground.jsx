import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../Theme/ThemeProvider';

/* Hachiware cat SVG path — simple white cat face with blue line */
const HACHI_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <!-- body -->
  <ellipse cx="20" cy="24" rx="12" ry="10" fill="rgba(255,255,255,0.18)"/>
  <!-- head -->
  <circle cx="20" cy="14" r="10" fill="rgba(255,255,255,0.18)"/>
  <!-- ears -->
  <polygon points="11,6 8,0 15,5" fill="rgba(255,255,255,0.18)"/>
  <polygon points="29,6 32,0 25,5" fill="rgba(255,255,255,0.18)"/>
  <!-- hachiware line (blue curved) -->
  <path d="M16 10 Q20 16 24 10" stroke="rgba(120,180,255,0.55)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- eyes -->
  <circle cx="16" cy="12" r="1.5" fill="rgba(120,180,255,0.5)"/>
  <circle cx="24" cy="12" r="1.5" fill="rgba(120,180,255,0.5)"/>
  <!-- nose -->
  <ellipse cx="20" cy="15.5" r="1.2" ry="0.8" fill="rgba(255,180,200,0.5)"/>
</svg>`);

const HACHI_SVG_PINK = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <ellipse cx="20" cy="24" rx="12" ry="10" fill="rgba(255,200,210,0.22)"/>
  <circle cx="20" cy="14" r="10" fill="rgba(255,200,210,0.22)"/>
  <polygon points="11,6 8,0 15,5" fill="rgba(255,200,210,0.22)"/>
  <polygon points="29,6 32,0 25,5" fill="rgba(255,200,210,0.22)"/>
  <path d="M16 10 Q20 16 24 10" stroke="rgba(220,80,120,0.4)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="16" cy="12" r="1.5" fill="rgba(220,80,120,0.4)"/>
  <circle cx="24" cy="12" r="1.5" fill="rgba(220,80,120,0.4)"/>
  <ellipse cx="20" cy="15.5" r="1.2" ry="0.8" fill="rgba(255,120,160,0.4)"/>
</svg>`);

function OceanBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const isHachiware = theme.startsWith('hachiware');
  const isLight = theme === 'light' || theme === 'hachiware-light';
  const isHachiDark = theme === 'hachiware-dark';
  const isHachiLight = theme === 'hachiware-light';
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const brandingUrl = useMemo(() => (
    isHachiDark ? '/api/branding/hachiware/dark'
      : isHachiLight ? '/api/branding/hachiware/light'
      : null
  ), [isHachiDark, isHachiLight]);
  const [brandingLoaded, setBrandingLoaded] = useState(false);
  const [brandingVersion, setBrandingVersion] = useState(() => Date.now());
  const brandingSrc = useMemo(() => (
    brandingUrl ? `${brandingUrl}?v=${brandingVersion}` : null
  ), [brandingUrl, brandingVersion]);
  const photoOpacity = useMemo(() => {
    if (!isHachiware) return 0;
    if (isAdminRoute) return isHachiLight ? 0.09 : 0.12;
    return isHachiLight ? 0.24 : 0.34;
  }, [isHachiware, isHachiLight, isAdminRoute]);
  const patternOpacity = useMemo(() => {
    if (!isHachiware) return 0;
    if (isAdminRoute) return isHachiLight ? 0.03 : 0.05;
    return isHachiLight ? 0.2 : 0.16;
  }, [isHachiware, isHachiLight, isAdminRoute]);

  useEffect(() => {
    const onBrandingUpdated = (event) => {
      const nextVersion = Number(event?.detail?.timestamp) || Date.now();
      setBrandingVersion(nextVersion);
    };
    window.addEventListener('branding-hachiware-updated', onBrandingUpdated);
    return () => {
      window.removeEventListener('branding-hachiware-updated', onBrandingUpdated);
    };
  }, []);

  useEffect(() => {
    if (!brandingUrl || !isHachiware) {
      setBrandingLoaded(false);
      return;
    }
    let active = true;
    const img = new Image();
    img.onload = () => { if (active) setBrandingLoaded(true); };
    img.onerror = () => { if (active) setBrandingLoaded(false); };
    img.src = brandingSrc;
    return () => { active = false; };
  }, [brandingSrc, brandingUrl, isHachiware, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Build pattern image for hachiware modes
    let patternImg = null;
    if (isHachiware) {
      const svgData = isHachiLight ? HACHI_SVG_PINK : HACHI_SVG;
      const img = new Image();
      img.src = `data:image/svg+xml,${svgData}`;
      patternImg = img;
    }

    // Bubbles (ocean or hachiware-themed)
    const bubbles = Array.from({ length: isHachiware ? 50 : 30 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * (isHachiware ? 18 : 3) + (isHachiware ? 10 : 1),
      speed: Math.random() * 0.2 + 0.05,
      opacity: Math.random() * (isHachiware ? 0.12 : 0.25) + 0.04,
      drift: Math.random() * 0.4 - 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      isHachi: isHachiware && i % 2 === 0,
    }));

    let animId;
    let imgReady = false;
    if (patternImg) {
      patternImg.onload = () => { imgReady = true; };
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((b) => {
        ctx.save();
        ctx.globalAlpha = b.opacity;

        if (isHachiware && imgReady && b.isHachi) {
          // Draw hachiware cat icon
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rotation);
          ctx.drawImage(patternImg, -b.r / 2, -b.r / 2, b.r, b.r);
          b.rotation += b.rotSpeed;
        } else {
          // Draw bubble
          ctx.beginPath();
          ctx.arc(b.x, b.y, isHachiware ? 3 : b.r, 0, Math.PI * 2);
          const color = isHachiDark
            ? `rgba(232, 121, 168, ${b.opacity})`
            : isHachiLight
            ? `rgba(225, 29, 72, ${b.opacity})`
            : `rgba(59, 130, 246, ${b.opacity})`;
          ctx.fillStyle = color;
          ctx.fill();
        }

        ctx.restore();

        b.y -= b.speed;
        b.x += b.drift;
        if (b.y < -40) { b.y = canvas.height + 40; b.x = Math.random() * canvas.width; }
        if (b.x < -40) b.x = canvas.width + 40;
        if (b.x > canvas.width + 40) b.x = -40;
      });

      animId = requestAnimationFrame(animate);
    };

    // Small delay so image has time to load
    const startDelay = setTimeout(() => animate(), 100);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(startDelay);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <div className={`ocean-bg ${isAdminRoute ? 'admin-bg' : ''}`}>
      <canvas ref={canvasRef} />
      {/* Hachiware pattern overlay — repeating CSS background */}
      {isHachiware && (
        <>
          <div
            className="hachiware-photo-overlay"
            style={{
              backgroundImage: brandingLoaded && brandingSrc ? `url("${brandingSrc}")` : 'none',
              opacity: photoOpacity,
            }}
          />
          <div
            className={`hachiware-pattern-overlay ${isHachiLight ? 'hachi-light' : 'hachi-dark'} ${isAdminRoute ? 'hachi-admin-muted' : ''}`}
            style={{ opacity: patternOpacity }}
          />
        </>
      )}
      {/* Glass/matte overlay */}
      <div className={`theme-overlay ${isLight ? 'theme-overlay-glass' : 'theme-overlay-matte'}`} />
    </div>
  );
}

export default OceanBackground;
