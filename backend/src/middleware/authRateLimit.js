const attempts = new Map();

export const authRateLimit = ({ windowMs = 15 * 60 * 1000, max = 10 } = {}) =>
  (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const current = attempts.get(key);

    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({ message: 'Too many authentication attempts. Please try again later.' });
    }

    next();
  };
