const Conversations = require("../models/conservations");
const HttpError = require("../models/http-error");

//post conv
exports.createConversation = async (req, res, next) => {
  let savedConv;
  const newConv = new Conversations({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    savedConv = await newConv.save();
  } catch (error) {
    const err = new HttpError("Something went wrong, please try again", 500);
    return next(err);
  }

  res.status(201).json({
    message: "Created",
    conv: savedConv,
  });
};

//get conv of a user
exports.getConvOfUser = async (req, res, next) => {
  let conv;
  try {
    conv = await Conversations.find({
      members: {
        $in: [req.params.userId],
      },
    });
  } catch (error) {
    const err = new HttpError("Something went wrong, please try again", 500);
    return next(err);
  }
  res.status(200).json(conv);
};

//get conv of two users in a conversation

exports.getConvOfTwoUsers = async (req, res, next) => {
  let conv;
  try {
    conv = await Conversations.findOne({
      members: {
        $all: [req.params.senderId, req.params.receiverId],
      },
    });
  } catch (error) {
    const err = new HttpError("Something went wrong, please try again", 500);
    return next(err);
  }
  res.status(200).json(conv);
};
