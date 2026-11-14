const jwt = require('jsonwebtoken');
const { User } = require('./models');

async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(claims.sub).select('name email role company active');
    if (!user || !user.active) return res.status(401).json({ message: 'Account unavailable' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
    next();
  };
}

module.exports = { requireAuth, allowRoles };
