const { Router } = require('express');

const profileController = require('../../controllers/admin/profileController');

const router = new Router();

router.get('/profile', profileController.getProfile);
router.post('/edit-profile', profileController.handleEditProfile);

module.exports = router;