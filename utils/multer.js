const multer = require('multer');
const uuid = require('uuid').v4;

exports.storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/uploads/img/')
    },
    filename: (req, file, callback) => {
        callback(null, `${uuid()}_${file.originalname}`)
    }
});

exports.fileFilter = (req, file, callback) => {
    if (file.mimetype == 'image/bmp') {
        callback('پسوند bmp پشتیبانی نمیشود', false);
    } else if (file.mimetype == 'image/png') {
        callback('پسوند png پشتیبانی نمیشود', false);
    }
    else {
        callback(null, true);
    }
};