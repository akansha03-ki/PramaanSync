/**
 * Role-Based Access Control Middleware
 * Roles: Admin | Inspector | Investigator | Researcher
 */
const rbacMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden. Role '${req.user.role}' lacks permission for this resource. Allowed roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = rbacMiddleware;
