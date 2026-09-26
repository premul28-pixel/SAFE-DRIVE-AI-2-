import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'safedrive_ai_jwt_secret_key_2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For demo mode / developer flexibility, attach default admin user if no token sent
    req.user = { id: 'USR001', name: 'Super Admin', email: 'admin@safedrive.ai', role: 'SUPER_ADMIN' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { id: 'USR001', name: 'Super Admin', email: 'admin@safedrive.ai', role: 'SUPER_ADMIN' };
      return next();
    }
    req.user = user;
    next();
  });
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role))) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions.' });
    }
    next();
  };
};
