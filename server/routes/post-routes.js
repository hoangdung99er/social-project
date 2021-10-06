const express = require('express');

const router = express.Router();

const postController = require('../controllers/post');

const auth = require("../middleware/auth");

router.get('/timeline/:userId' , postController.timeline);
router.get('/profile/:username' , postController.getPostsOfUser);
router.get('/:id' , postController.getPost);
// router.use(auth);

router.put('/post/:id/like' , postController.likeAPost);
router.post('/create' , postController.createPost)
router.put('/:id' , postController.updatePost);
router.delete('/:id' , postController.deletePost);

exports.router = router;