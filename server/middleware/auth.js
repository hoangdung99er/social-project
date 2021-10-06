const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(new HttpError("Could not authorization", 403));
    }

    const decodedToken = jwt.verify(token, `${process.env.JWT_KEY}`);
    req.userData = {
      userId: decodedToken.userId,
    };
    next();
  } catch (error) {
    const err = new HttpError("Authentication failed", 401);
    return next(err);
  }
};
