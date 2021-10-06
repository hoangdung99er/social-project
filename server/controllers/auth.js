const User = require("../models/user");
const bcrypt = require("bcryptjs");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  let existingUser;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError(
      "Cannot generate hash password, please try again",
      401
    );
    return next(err);
  }

  try {
    existingUser = User.findOne({ username: username });
  } catch (error) {
    const err = new HttpError("Cannot fetch username from database", 500);
    return next(err);
  }

  if (!existingUser) {
    const error = new HttpError("Username already exists", 422);
    return next(error);
  }

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await user.save();
  } catch (error) {
    const err = new HttpError("Cannot create user , please try again", 422);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      `${process.env.JWT_KEY}`,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Signup failed, please try again", 500);
    return next(err);
  }

  res.status(201).json({
    user,
    userId : user._id,
    email: user.email,
    token : token
  });
};

exports.login = async (req, res, next) => {
  const { email, psw } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Something went wrong, logged in failed", 500);
    return next(err);
  }

  if (!existingUser) {
    const error = new HttpError("Could not find user", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(psw, existingUser.password);
  } catch (error) {
    const err = new HttpError("Could not log in, please check again", 500);
    return next(err);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid password, please try again", 403);
    return next(error);
  }
  const { password, ...others } = existingUser._doc;

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
      },
      `${process.env.JWT_KEY}`,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  res.status(200).json({
    user: others,
    userId : existingUser._id,
    email : existingUser.email,
    token : token 
  });
};
