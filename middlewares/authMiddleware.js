// Middleware to check if the user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};
