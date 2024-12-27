const path = require('path');
const fs = require('fs');

const User = require('../../models/userModel');
const { get500 } = require('../errorController');
const rootDir = require('../../utils/rootDir');

const sharp = require('sharp');
const shortId = require('shortid');

module.exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        res.render('admin/profile/profile', {
            pageTitle: 'پروفایل',
            path: '/dashboard/profile',
            layout: './layouts/adminLayout',
            fullName: req.user.fullName,
            user,
            errors: [],
            isAdmin: req.user.isAdmin,
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}
module.exports.handleEditProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);


        const image = req.files ? req.files.avatar : {};
        if ("name" in image) {
            req.body.avatar = image;
        } else {
            // create fake image
            req.body.avatar = {
                name: 'fakeImage',
                size: 66,
                mimetype: 'image/jpeg'
            };
        }

        const { fullName, bio } = req.body; // access to the enterd edit blog

        user.fullName = fullName;
        user.bio = bio;

        // replace new image
        if (req.body.avatar.name !== 'fakeImage') {
            const imageName = shortId.generate() + path.extname(image.name);
            const imagePath = `${rootDir}/public/uploads/user/${imageName}`;

            // deleted old image
            if (user.avatar !== 'user.png') {
                fs.unlink(`${rootDir}/public/uploads/user/${user.avatar}`, async (err) => {
                    if (err) {
                        console.log(err);
                        get500(req, res);
                    }
                });
            }
            if (imageName !== 'user.png') {
                // compress image and saved new image
                await sharp(image.data).jpeg({
                    quality: 50
                }).toFile(imagePath).catch((err) => {
                    if (err) {
                        console.log(err);
                        get500(req, res);
                    }
                });
            }

            user.avatar = imageName;
        }

        // save new blog to the db
        await user.save();

        res.redirect('/dashboard/profile');
    } catch (err) {
        const errors = [];

        err?.inner?.forEach(error => {
            errors.push({
                name: error.path,
                message: error.message
            });
        });

        res.render('admin/profile/profile', {
            pageTitle: 'پروفایل',
            path: '/dashboard/profile',
            layout: './layouts/adminLayout',
            fullName: req.user.fullName,
            user,
            errors,
            isAdmin: req.user.isAdmin,
        });
    }
}