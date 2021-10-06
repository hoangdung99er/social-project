const express = require("express");
const convController = require("./../controllers/conversations");
const router = express.Router();

router.post("/", convController.createConversation);
router.get("/:userId", convController.getConvOfUser);
router.get("/find/:senderId/:receiverId", convController.getConvOfTwoUsers);

exports.router = router;
