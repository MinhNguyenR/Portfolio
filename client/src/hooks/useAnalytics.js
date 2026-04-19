import { useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

const getFingerprint = () => {
  let fp = localStorage.getItem('portfolio_fp');
  if (!fp) {
    fp = 'fp_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('portfolio_fp', fp);
  }
  return fp;
};

export const useAnalytics = () => {
  const fingerprint = useRef(getFingerprint());
  const queue = useRef({ pageViews: [], interactions: [] });
  const flushTimer = useRef(null);

  // Record initial visit
  useEffect(() => {
    const recordVisit = async () => {
      try {
        await api.post('/analytics/visit', {
          fingerprint: fingerprint.current,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        });
      } catch (e) { /* silent fail */ }
    };
    recordVisit();

    // Flush queue every 10 seconds
    flushTimer.current = setInterval(flushQueue, 10000);
    return () => clearInterval(flushTimer.current);
  }, []);

  const flushQueue = async () => {
    const q = queue.current;
    if (q.pageViews.length === 0 && q.interactions.length === 0) return;

    const payload = {
      fingerprint: fingerprint.current,
      pageViews: [...q.pageViews],
      interactions: [...q.interactions],
    };
    q.pageViews = [];
    q.interactions = [];

    try {
      await api.post('/analytics/batch', payload);
    } catch (e) { /* silent fail */ }
  };

  const trackSection = useCallback((section, duration = 0, scrollDepth = 0) => {
    queue.current.pageViews.push({ section, duration, scrollDepth, timestamp: new Date() });
  }, []);

  const trackInteraction = useCallback((type, target, metadata = {}) => {
    queue.current.interactions.push({ type, target, metadata, timestamp: new Date() });
  }, []);

  return { trackSection, trackInteraction, fingerprint: fingerprint.current };
};
