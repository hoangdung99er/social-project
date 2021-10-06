const Post = require("../models/post");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const post = require("../models/post");
const { router } = require("../routes/user-routes");

exports.createPost = async (req, res, next) => {
  const post = new Post(req.body);
  try {
    await post.save();
  } catch (error) {
    const err = new HttpError(
      "Could not create post, please try again later.",
      500
    );
    return next(err);
  }
  res.status(200).json({
    message: "Created.",
  });
};

exports.updatePost = async (req, res, next) => {
  const id = req.params.id;
  let post;
  try {
    post = await Post.findById(id);
  } catch (error) {
    const err = new HttpError("Something wrong here, please try again", 500);
    return next(err);
  }

  if (!post) {
    const err = new HttpError("Cannot find post", 404);
    return next(err);
  }

  if (post.userId.toString() === req.body.userId) {
    try {
      await post.updateOne({ $set: req.body });
    } catch (error) {
      const err = new HttpError("Something wrong here, please try again", 401);
      return next(err);
    }
  } else {
    const err = new HttpError("Unauthorized", 403);
    return next(err);
  }

  res.status(200).json({
    message: "Updated",
  });
};

exports.deletePost = async (req, res, next) => {
  const id = req.params.id;
  let post;
  try {
    post = await Post.findById(id);
  } catch (error) {
    const err = new HttpError("Something wrong here, please try again", 500);
    return next(err);
  }

  if (!post) {
    const err = new HttpError("Cannot find post", 404);
    return next(err);
  }

  if (post.userId.toString() === req.body.userId) {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      await post.remove({ session });
      await post.deleteOne();
      await session.commitTransaction();
    } catch (error) {
      const err = new HttpError("Something wrong here, please try again", 401);
      return next(err);
    }
  } else {
    const err = new HttpError("Unauthorized", 403);
    return next(err);
  }

  res.status(200).json({
    message: "Deleted",
  });
};

exports.likeAPost = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.body.userId;
  let post;
  try {
    post = await Post.findById(postId);
  } catch (error) {
    const err = new HttpError("Something wrong here, please try again", 500);
    return next(err);
  }

  if (!post) {
    const err = new HttpError("Cannot find post", 404);
    return next(err);
  }

  try {
    const user = await User.findById(userId);
    if (!post.likes.includes(user._id)) {
      try {
        await post.updateOne({ $push: { likes: user._id } });
      } catch (error) {
        const err = new HttpError(
          "Cannot like this post, try again later",
          404
        );
        return next(err);
      }
      res.status(200).json({
        message: "This post has been liked.",
      });
    } else {
      try {
        await post.updateOne({ $pull: { likes: user._id } });
      } catch (error) {
        const err = new HttpError(
          "Cannot like this post, try again later",
          404
        );
        return next(err);
      }
      res.status(200).json({
        message: "This post has been disliked.",
      });
    }
  } catch (error) {
    const err = new HttpError("Unauthorized", 403);
    return next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.id;
  let post;
  try {
    post = await Post.findById(postId).populate("userId");
  } catch (error) {
    const err = new HttpError("Something wrong here, please try again", 500);
    return next(err);
  }
  res.status(200).json({
    post: post.toObject({ getters: true }),
  });
};

exports.timeline = async (req, res, next) => {
  const userId = req.params.userId;
  let allPostOfUser;
  let friendPosts;
  try {
    const currUser = await User.findById(userId);

    allPostOfUser = await Post.find({ userId: currUser._id }).populate(
      "userId",
      "-password -email"
    );

    // Array nen dung toan tu ...
    friendPosts = await Promise.all(
      currUser.followings.map((friendId) => {
        return Post.find({ userId: friendId }).populate(
          "userId",
          "-password -email"
        );
      })
    );
  } catch (error) {
    const err = new HttpError("Something wrong here, please try again", 500);
    return next(err);
  }
  res.status(200).json(allPostOfUser.concat(...friendPosts));
};

//get user's all posts
exports.getPostsOfUser = async (req, res, next) => {
  let user;
  let posts;
  const { username } = req.params;
  try {
    user = await User.findOne({ username });
    posts = await Post.find({ userId: user._id }).populate("userId", "-password -email");
  } catch (error) {
    const err = new HttpError("Something wrong here, please try again", 500);
    return next(err);
  }
  res.status(200).json(
    posts,
  );
};
