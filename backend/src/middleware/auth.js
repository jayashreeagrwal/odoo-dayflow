import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { mockStore } from '../utils/mockStore.js';

export const protect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (global.USE_IN_MEMORY_DB) {
        req.user = mockStore.users.find((u) => u._id === decoded.id);
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User belonging to token no longer exists' });
      }

      if (
        req.user.emailVerified === false ||
        req.user.jobDetails?.status === 'Inactive' ||
        Number(req.user.tokenVersion || 0) !== Number(decoded.tokenVersion || 0)
      ) {
        return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' });
      }

      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};
