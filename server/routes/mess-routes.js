const express = require("express");
const messController = require("./../controllers/messages");
const router = express.Router();

router.post("/", messController.addMessage);
router.get("/:conversationId", messController.getMessage);

exports.router = router;
