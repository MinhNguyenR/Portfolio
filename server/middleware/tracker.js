const UAParser = require('ua-parser-js');

const tracker = (req, res, next) => {
  try {
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();

    req.visitorInfo = {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      browser: { name: ua.browser.name || 'unknown', version: ua.browser.version || '' },
      os: { name: ua.os.name || 'unknown', version: ua.os.version || '' },
      device: { type: ua.device.type || 'desktop', vendor: ua.device.vendor || '', model: ua.device.model || '' },
      referrer: req.headers.referer || req.headers.referrer || 'direct',
      language: req.headers['accept-language']?.split(',')[0] || 'unknown',
    };
  } catch (err) {
    req.visitorInfo = { ip: 'unknown', userAgent: 'unknown' };
  }
  next();
};

module.exports = tracker;
