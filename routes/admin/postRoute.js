const { Router } = require('express');

const router = new Router();
const postController = require('../../controllers/admin/postController');

router.get('/add-post', postController.getAddPost);
router.post('/add-post', postController.handleAddPost);

router.get('/edit-post/:id', postController.getEditPost);
router.post('/edit-post/:id', postController.handleEditPost);

router.get('/delete-post/:id' , postController.getDeletePost);

router.get('/comments-post/:id' , postController.getCommentsPost);
router.get('/delete-comment/:id' , postController.getDeleteComment);

router.get('/participtions-post/:id' , postController.getParticiptionsPost);
router.get('/change-particiption-status/:id' , postController.changeParticiptionStatusPost);

router.get('/analysis-post/:id', postController.getAnalysisPost);
router.get('/analysis-all-post', postController.getAnalysisAllPost);

module.exports = router;