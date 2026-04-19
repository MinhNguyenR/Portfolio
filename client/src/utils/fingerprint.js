/**
 * Advanced browser fingerprinting utility
 * Collects: IP, browser, screen, hardware, timezone, canvas/WebGL fingerprints
 */

// ── Canvas fingerprint ──────────────────────────────────────────────────────
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Hachiware🐱', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('Hachiware🐱', 4, 17);
    return canvas.toDataURL().slice(-50); // last 50 chars as hash
  } catch { return null; }
}

// ── WebGL fingerprint ───────────────────────────────────────────────────────
function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { fingerprint: null, renderer: null };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null;
    const vendor   = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null;
    // Simple hash from params
    const params = [
      gl.getParameter(gl.VERSION),
      gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      gl.getParameter(gl.VENDOR),
      renderer,
    ].join('|');
    return { fingerprint: btoa(params).slice(0, 24), renderer: renderer || vendor };
  } catch { return { fingerprint: null, renderer: null }; }
}

// ── Audio fingerprint ───────────────────────────────────────────────────────
async function getAudioFingerprint() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    const oscillator = ctx.createOscillator();
    const analyser   = ctx.createAnalyser();
    const gain       = ctx.createGain();
    gain.gain.value = 0;
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;
    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(0);
    const data = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(data);
    oscillator.stop();
    await ctx.close();
    const sum = data.slice(0, 30).reduce((a, b) => a + Math.abs(b), 0);
    return sum.toFixed(6);
  } catch { return null; }
}

// ── Fonts ───────────────────────────────────────────────────────────────────
function getAvailableFonts() {
  const testFonts = [
    'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia',
    'Tahoma', 'Trebuchet MS', 'Impact', 'Palatino', 'Helvetica',
    'Comic Sans MS', 'Garamond', 'Century Gothic', 'Segoe UI',
    'Lucida Console', 'Ubuntu', 'Roboto', 'Open Sans',
  ];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const BASELINE_FONT = 'monospace';
  ctx.font = `12px ${BASELINE_FONT}`;
  const baseWidth = ctx.measureText('mmm').width;
  return testFonts.filter(font => {
    ctx.font = `12px '${font}', ${BASELINE_FONT}`;
    return ctx.measureText('mmm').width !== baseWidth;
  });
}

// ── Screen info ─────────────────────────────────────────────────────────────
function getScreenInfo() {
  const s = window.screen;
  return {
    width:        s.width,
    height:       s.height,
    availWidth:   s.availWidth,
    availHeight:  s.availHeight,
    colorDepth:   s.colorDepth,
    pixelDepth:   s.pixelDepth,
    pixelRatio:   window.devicePixelRatio || 1,
    windowWidth:  window.innerWidth,
    windowHeight: window.innerHeight,
  };
}

// ── Hardware / Navigator ────────────────────────────────────────────────────
function getHardwareInfo() {
  const n = navigator;
  return {
    cores:       n.hardwareConcurrency || null,
    memory:      n.deviceMemory || null,
    touchPoints: n.maxTouchPoints || 0,
    vendor:      n.vendor || null,
    product:     n.product || null,
    appCodeName: n.appCodeName || null,
    platform:    n.platform || null,
    appName:     n.appName || null,
    appVersion:  n.appVersion || null,
    userAgent:   n.userAgent,
    language:    n.language,
    languages:   Array.from(n.languages || []),
    cookieEnabled: n.cookieEnabled,
    doNotTrack:  n.doNotTrack,
    onLine:      n.onLine,
  };
}

// ── Timezone ────────────────────────────────────────────────────────────────
function getTimezoneInfo() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -new Date().getTimezoneOffset();
  const local  = new Date().toString();
  return { zone: tz, offset, local };
}

// ── Plugins ─────────────────────────────────────────────────────────────────
function getPlugins() {
  try {
    return Array.from(navigator.plugins).map(p => p.name).slice(0, 20);
  } catch { return []; }
}

// ── Capabilities ─────────────────────────────────────────────────────────────
function getCapabilities() {
  const canvas = document.createElement('canvas');
  const webgl = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  return {
    webgl,
    webrtc:     !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection),
    flash:      false, // always false in modern browsers
    java:       false, // always false in modern browsers
    cookies:    navigator.cookieEnabled,
    javascript: true,
    plugins:    getPlugins(),
  };
}

// ── Simple fingerprint hash ──────────────────────────────────────────────────
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // 32-bit int
  }
  return Math.abs(hash).toString(36);
}

// ── MAIN: Collect all fingerprint data ─────────────────────────────────────
export async function collectFingerprint() {
  const [audioFp, canvasFp, webglInfo, fonts] = await Promise.all([
    getAudioFingerprint(),
    Promise.resolve(getCanvasFingerprint()),
    Promise.resolve(getWebGLInfo()),
    Promise.resolve(getAvailableFonts()),
  ]);

  const screen   = getScreenInfo();
  const hardware = getHardwareInfo();
  const timezone = getTimezoneInfo();
  const capes    = getCapabilities();
  const plugins  = getPlugins();

  // Build a stable fingerprint ID
  const fpString = [
    hardware.userAgent,
    hardware.language,
    screen.width, screen.height,
    screen.colorDepth,
    hardware.cores,
    hardware.memory,
    hardware.touchPoints,
    timezone.zone,
    canvasFp,
    webglInfo.fingerprint,
  ].join('|');
  const fingerprint = simpleHash(fpString);

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const clientExtra = {
    pdfViewerEnabled: typeof navigator.pdfViewerEnabled === 'boolean' ? navigator.pdfViewerEnabled : undefined,
    webdriver: navigator.webdriver === true,
    connection: conn
      ? {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData,
        }
      : null,
    vendorSub: navigator.vendorSub || undefined,
    productSub: navigator.productSub || undefined,
  };

  return {
    fingerprint,
    browser: {
      userAgent:    hardware.userAgent,
      platform:     hardware.platform,
      language:     hardware.language,
      languages:    hardware.languages,
      cookieEnabled: hardware.cookieEnabled,
      doNotTrack:   hardware.doNotTrack,
    },
    screen,
    hardware: {
      cores:       hardware.cores,
      memory:      hardware.memory,
      touchPoints: hardware.touchPoints,
      vendor:      hardware.vendor,
      product:     hardware.product,
      appCodeName: hardware.appCodeName,
      appName:     hardware.appName,
      appVersion:  hardware.appVersion,
      platform:    hardware.platform,
      onLine:      hardware.onLine,
    },
    timezone,
    fingerprints: {
      canvas:       canvasFp,
      webgl:        webglInfo.fingerprint,
      webglRenderer: webglInfo.renderer,
      audio:        audioFp,
      fonts,
      clientRects:  null,
    },
    capabilities: {
      ...capes,
      plugins,
    },
    referrer:  document.referrer || null,
    entryPage: window.location.pathname,
    clientExtra,
  };
}
