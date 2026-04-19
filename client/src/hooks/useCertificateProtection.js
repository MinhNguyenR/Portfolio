import { useEffect, useMemo, useState } from 'react';
import { collectFingerprint } from '../utils/fingerprint';

export function useCertificateProtection(enabled) {
  const [blocked, setBlocked] = useState(false);
  const [fpShort, setFpShort] = useState('anon');

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    collectFingerprint()
      .then((fp) => {
        if (active && fp?.fingerprint) setFpShort(String(fp.fingerprint).slice(0, 8));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let clearTimer = null;
    const blackout = (durationMs = 1200) => {
      if (clearTimer) clearTimeout(clearTimer);
      setBlocked(true);
      clearTimer = setTimeout(() => setBlocked(false), durationMs);
    };
    const onKeyDown = (e) => {
      const key = String(e.key || '').toLowerCase();
      const printKey = (e.ctrlKey || e.metaKey) && key === 'p';
      const screenshotKey = key === 'printscreen';
      const devtoolShotKey = (e.ctrlKey || e.metaKey) && e.shiftKey && key === 's';
      if (printKey || screenshotKey || devtoolShotKey) {
        e.preventDefault();
        e.stopPropagation();
        blackout(4200);
      }
    };
    const onBeforePrint = () => blackout(4200);
    const onAfterPrint = () => blackout(2200);
    const onVis = () => {
      if (document.visibilityState !== 'visible') {
        blackout(2600);
      }
    };
    const onBlur = () => blackout(2600);
    const onFocus = () => blackout(900);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      if (clearTimer) clearTimeout(clearTimer);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled]);

  const watermarkText = useMemo(() => {
    const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
    return `Nguyễn Đặng Tường Minh | ${fpShort} | ${ts}`;
  }, [fpShort]);

  return {
    blocked,
    watermarkText,
    protectionClassName: enabled ? 'certificate-protected' : '',
    suppressContextMenu: (e) => e.preventDefault(),
  };
}

