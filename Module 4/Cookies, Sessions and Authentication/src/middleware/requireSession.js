const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');

function authenticationRequired(res) {
  return res.status(401).json({
    error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
  });
}

module.exports = async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;
    if (typeof sessionId !== 'string') return authenticationRequired(res);

    const session = sessionStore.get(sessionId);
    if (!session) return authenticationRequired(res);

    const user = await userRepository.findPublicById(session.userId);
    if (!user) {
      sessionStore.destroy(sessionId);
      return authenticationRequired(res);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
