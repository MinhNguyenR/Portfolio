/**
 * POST /api/track
 * Receives detailed fingerprint data from client, upserts into Visitor collection,
 * then enriches IP data in background via ip-api.com
 */
const Visitor = require('../models/Visitor');
const UAParser = require('ua-parser-js');

exports.track = async (req, res) => {
  try {
    const {
      fingerprint, browser: bInfo, screen, hardware,
      timezone, fingerprints, capabilities, referrer, entryPage,
      clientExtra,
    } = req.body;

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
      .split(',')[0].trim().replace('::ffff:', '');

    const ua = new UAParser(bInfo?.userAgent || req.headers['user-agent'] || '').getResult();

    const setDoc = {
      ip,
      browser: {
        name:          ua.browser.name || bInfo?.name || 'Unknown',
        version:       ua.browser.version || '',
        userAgent:     bInfo?.userAgent || '',
        platform:      bInfo?.platform || hardware?.platform || '',
        language:      bInfo?.language || '',
        languages:     bInfo?.languages || [],
        cookieEnabled: bInfo?.cookieEnabled,
        doNotTrack:    bInfo?.doNotTrack,
      },
      os: {
        name:    ua.os.name || '',
        version: ua.os.version || '',
      },
      device: {
        type:   ua.device.type || 'desktop',
        vendor: ua.device.vendor || '',
        model:  ua.device.model || '',
      },
      screen:    screen || {},
      hardware:  hardware || {},
      timezone:  timezone || {},
      fingerprints: fingerprints || {},
      capabilities: capabilities || {},
      referrer:  referrer || 'direct',
      entryPage: entryPage || '/',
      lastVisit: new Date(),
    };
    if (clientExtra && typeof clientExtra === 'object' && Object.keys(clientExtra).length) {
      setDoc.clientExtra = clientExtra;
    }

    // Upsert visitor
    const update = {
      $set: setDoc,
      $inc:      { visitCount: 1 },
      $setOnInsert: { firstVisit: new Date() },
    };

    await Visitor.findOneAndUpdate(
      { fingerprint: fingerprint || ip },
      update,
      { upsert: true, new: true }
    );

    res.json({ ok: true });

    // ── Enrich with IP geo data in background ───────────────────────────────
    setImmediate(async () => {
      if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('::')) return;
      try {
        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,zip,isp,org,as,hosting,proxy,mobile,lat,lon,timezone,query`)
          .then(r => r.json());
        if (geo.status === 'success') {
          await Visitor.findOneAndUpdate(
            { fingerprint: fingerprint || ip },
            {
              $set: {
                'network.ip':          geo.query,
                'network.country':     geo.country,
                'network.countryCode': geo.countryCode,
                'network.region':      geo.regionName,
                'network.city':        geo.city,
                'network.zip':         geo.zip,
                'network.isp':         geo.isp,
                'network.org':         geo.org,
                'network.timezone':    geo.timezone,
                'network.lat':         geo.lat,
                'network.lon':         geo.lon,
                'network.proxy':       geo.proxy || false,
                'network.mobile':      geo.mobile || false,
              },
            }
          );
        }
      } catch { /* ignore enrichment errors */ }
    });

  } catch (err) {
    console.error('[Track]', err.message);
    res.status(500).json({ ok: false });
  }
};
