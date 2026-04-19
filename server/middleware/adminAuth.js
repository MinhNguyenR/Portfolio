const jwt = require('jsonwebtoken');

module.exports = function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-admin-key']) {
    token = req.headers['x-admin-key'];
  }

  if (!token) {
    return res.status(403).json({ error: 'Forbidden. No token provided.' });
  }

  const expected = process.env.ADMIN_SECRET_KEY;
  try {
    jwt.verify(token, expected);
    return next();
  } catch (err) {
    // Fallback for old sessions that didn't use JWT. Will be rejected if invalid.
    if (token === expected) return next();
    return res.status(403).json({ error: 'Forbidden. Invalid or expired token.' });
  }
};
