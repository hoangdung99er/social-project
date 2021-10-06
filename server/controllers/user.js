const User = require("../models/user");
const HttpError = require("../models/http-error");
const brycpt = require("bcryptjs");
const { router } = require("../routes/auth-routes");

//get all users
exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (error) {
    const err = new HttpError("Cannot fetch data from server", 500);
    return next(err);
  }
  res.status(200).json({ users });
};

//update user by Id
exports.updateUserById = async (req, res, next) => {
  let user;
  const userId = req.params.uid;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("Could not find user, please try again", 500);
    return next(err);
  }

  if (req.body.userId === userId || req.body.isAdmin) {
    if (req.body.password) {
      try {
        req.body.password = await brycpt.hash(req.body.password, 12);
      } catch (error) {
        const err = new HttpError(
          "Cannot update password, please try again later",
          500
        );
        return next(err);
      }
    }
    try {
      await User.findByIdAndUpdate(userId, {
        $set: req.body,
      });
    } catch (error) {
      const err = new HttpError(
        "Cannot update user, please try again later",
        500
      );
      return next(err);
    }
    res.status(200).json({
      message: "Account has been updated",
      user: user.toObject({ getters: true }),
    });
  } else {
    const error = new HttpError("You can update only your account!!", 403);
    return next(error);
  }
};

// get Friends List
exports.getFriends = async (req, res, next) => {
  let user;
  const userId = req.params.userId;
  try {
    user = await User.findById(userId).populate("followings", "-password -email");
  } catch (error) {
    const err = new HttpError("Something went wrong, please try again", 500);
    return next(err);
  }
  res.status(200).json(user);
};

//Delete user by id
exports.deleteUserById = async (req, res, next) => {
  let user;
  const userId = req.params.uid;
  try {
    user = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("Could not find user, please try again", 500);
    return next(err);
  }

  if (req.body.userId === userId || req.body.isAdmin) {
    try {
      await User.deleteOne({ _id: userId });
      // await User.findByIdAndRemove(userId);
    } catch (error) {
      const err = new HttpError("Could not delete user", 500);
      return next(err);
    }
    res.status(200).json({
      message: "DELETED",
    });
  } else {
    const error = new HttpError("You can delete only your account!!", 403);
    return next(error);
  }
};

//get a user
exports.getUser = async (req, res, next) => {
  let user;
  const { userId, username } = req.query;
  try {
    user = userId
      ? await User.findById(userId).select("-password -updatedAt")
      : await User.findOne({ username: username }).select(
          "-password -updatedAt"
        ).populate("followings", "-password -email");
    // const {password, updatedAt, ...other} = user._doc;
  } catch (error) {
    const err = new HttpError("Could not find user, please try again", 500);
    return next(err);
  }
  res.status(200).json(user);
};

exports.follow = async (req, res, next) => {
  const userIdWillBeFollowed = req.params.uid;
  const userIdFollower = req.body.userId;

  if (userIdFollower !== userIdWillBeFollowed) {
    try {
      const userWillBeFollowed = await User.findById(userIdWillBeFollowed);
      const follower = await User.findById(userIdFollower);
      if (!userWillBeFollowed.followers.includes(userIdFollower)) {
        await userWillBeFollowed.updateOne({
          $push: { followers: userIdFollower },
        });
        await follower.updateOne({
          $push: { followings: userIdWillBeFollowed },
        });
        res.status(200).json({
          message: "User has been followed.",
        });
      } else {
        res.status(403).json({
          message: "You already follow this user.",
        });
      }
    } catch (error) {
      const err = new HttpError(
        "Could not follow this user, please try again.",
        500
      );
      return next(err);
    }
  } else {
    res.status(403).json({
      message: "You could not followed yourself.",
    });
  }
};

exports.unfollow = async (req, res, next) => {
  const userIdWillBeFollowed = req.params.uid;
  const userIdFollower = req.body.userId;

  if (userIdFollower !== userIdWillBeFollowed) {
    try {
      const userWillBeFollowed = await User.findById(userIdWillBeFollowed);
      const follower = await User.findById(userIdFollower);
      if (userWillBeFollowed.followers.includes(userIdFollower)) {
        await userWillBeFollowed.updateOne({
          $pull: { followers: userIdFollower },
        });
        await follower.updateOne({
          $pull: { followings: userIdWillBeFollowed },
        });
        res.status(200).json({
          message: "User has been unfollowed.",
        });
      } else {
        res.status(403).json({
          message: "You dont follow this user.",
        });
      }
    } catch (error) {
      const err = new HttpError(
        "Could not unfollow this user, please try again.",
        500
      );
      return next(err);
    }
  } else {
    res.status(403).json({
      message: "You could not unfollowed yourself.",
    });
  }
};
