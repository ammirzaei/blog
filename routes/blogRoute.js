const { Router } = require('express');

const router = new Router();
const blogController = require('../controllers/blogController');

router.get('/blogs', blogController.getAllBlogs);
router.post('/blogs/search', blogController.getAllBlogs);
router.get('/blogs/search', blogController.getAllBlogs);

router.get('/blog/:id', blogController.getBlog);

router.post('/blog/saved/:id', blogController.savedHandle);

router.post('/blog/like/:id', blogController.likedHandle);

router.post('/blog/follower/:id', blogController.followerHandle);

router.post('/blog/submit-comment', blogController.submitComment);

router.post('/blog/submit-particiption/:id', blogController.submitParticiption);

router.get('/user/:id', blogController.getUser);

module.exports = router;