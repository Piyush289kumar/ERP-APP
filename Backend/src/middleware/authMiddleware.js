export const ensureAuth = (req, res, next) => {
  if ((!req, user)) {
    return res.status(401).json({ message: "Not Authorized" });
  }
  next();
};
