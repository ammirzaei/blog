const {Router} = require('express');
const router = new Router();

const errorController = require('../controllers/errorController');

// NotFound Page
router.use(errorController.get404);

module.exports = router;