/**
 * Authority authentication middleware.
 *
 * Verifies the Firebase ID token sent by the authenticated authority
 * frontend and attaches `req.authority = { uid, name, role }` to the
 * request. Reuses whatever `firebase-admin` instance the main project has
 * already initialized (see INTEGRATION_GUIDE.md — do not call
 * admin.initializeApp() again here).
 *
 * Expects: `Authorization: Bearer <idToken>` header.
 */

const admin = require('firebase-admin');

async function requireAuthority(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    // Authority accounts are expected to carry a custom claim of
    // { role: 'authority' } set during onboarding. Adjust this check if
    // the main project's auth flow assigns roles differently.
    if (decoded.role && decoded.role !== 'authority') {
      return res.status(403).json({ error: 'This endpoint requires an authority account.' });
    }

    req.authority = {
      uid: decoded.uid,
      name: decoded.name || decoded.email || 'District Authority',
      role: decoded.role || 'authority',
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.', detail: err.message });
  }
}

module.exports = { requireAuthority };
