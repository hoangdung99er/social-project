const express = require("express");

const router = express.Router();

const userController = require("../controllers/user");

const auth = require("../middleware/auth");

router.get("/" , userController.getUser);
router.get("/friends/:userId" , userController.getFriends);
router.get("/get-all" , userController.getUsers);
// router.use(auth);
router.put("/:uid/follow", userController.follow);
router.put("/:uid/unfollow", userController.unfollow);
router.put("/user/:uid" , userController.updateUserById);
router.delete("/user/:uid", userController.deleteUserById);

exports.router = router;
