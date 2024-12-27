const { Router } = require('express');

const adminController = require('../../controllers/admin/adminController');

const router = new Router();

// admin Page
router.get('/', adminController.getDashboard);

router.get('/contact-us', adminController.getContactUs);

router.get('/contact-us', adminController.getContactUs);
router.get('/delete-contact/:id' , adminController.deleteContactUsHandle);

// Searching
router.post('/search', adminController.getDashboard);

// Upload Image
router.post('/image-upload', adminController.uploadImage);

router.get('/blogs-saved', adminController.getSavedPosts);


module.exports = router;