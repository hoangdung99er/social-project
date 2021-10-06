const Message = require("../models/message");
const HttpError = require("../models/http-error");

// add
exports.addMessage = async (req, res, next) => {
  const message = new Message(req.body);
  let savedMessage;
  try {
    savedMessage = await message.save();
  } catch (error) {
    const err = new HttpError("Something went wrong, please try again", 500);
    return next(err);
  }
  res.status(201).json(savedMessage);
};

//get
exports.getMessage = async (req, res, next) => {
  let messages;
  try {
    messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate("conversationId");
  } catch (error) {
    const err = new HttpError("Something went wrong, please try again", 500);
    return next(err);
  }
  res.status(200).json(messages);
};
