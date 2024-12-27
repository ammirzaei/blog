const Blog = require('../models/blogModel');
const Contact = require('../models/contactModel');
const User = require('../models/userModel');

const { formatDateTime } = require('../utils/jalali');
const { truncateString } = require("../utils/helpers");
const { get500 } = require('./errorController');
const captchapng = require('captchapng');

let Captcha_Num;

// Home -- GET
module.exports.getHome = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'عمومی' }).populate('user').sort({ createdAt: 'desc' }).limit(5);
        const users = await User.find().sort({ follower: 'desc' }).limit(4);

        res.render('home/index', {
            pageTitle: 'وبلاگ',
            path: '/',
            blogs,
            users,
            formatDateTime,
            truncateString,
            isAuthenticated: req.isAuthenticated()
        });
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

// Contact Us -- GET
module.exports.getContactUs = (req, res) => {
    res.render('home/contactUs', {
        pageTitle: 'تماس با ما',
        path: '/contact-us',
        success: req.flash('Success'),
        error: req.flash('Error'),
        errors: [],
        isAuthenticated: req.isAuthenticated()
    });
}

// Contact Us -- POST
exports.handleContactUs = async (req, res) => {
    const errors = [];

    try {
        const captcha = Number(req.body.captcha);
        if (captcha) {
            if (captcha !== Captcha_Num) {
                errors.push({
                    name: 'captcha',
                    message: 'کد امنیتی صحیح نیست'
                });

                throw new Error();
            }
        }else {
            errors.push({
                name: 'captcha',
                message: 'وارد کردن کد امنیتی اجباری است'
            });

            throw new Error();
        }

        // model validation
        await Contact.contactValidation(req.body);

        await Contact.create({
            ...req.body,
            ipAddress: req.ip
        });

        req.flash('Success', 'پیام شما با موفقیت ثبت شد');
        res.redirect('/contact-us');

    } catch (err) {
        if (errors.length === 0) {
            // errors validation
            err.inner.forEach((error) => {
                errors.push({
                    name: error.path,
                    message: error.message
                });
            });
        }

        Captcha_Num = Math.floor(Math.random() * 100000); // set number captcha

        res.render('home/contactUs', {
            pageTitle: 'تماس با ما',
            path: '/contact-us',
            success: req.flash('Success'),
            error: req.flash('Error'),
            errors,
            isAuthenticated: req.isAuthenticated()
        });
    }
}

// Numeric Captcha -- GET
exports.getCaptcha = (req, res) => {
    Captcha_Num = Math.floor(Math.random() * 100000); // set number

    const captcha = new captchapng(80, 40, Captcha_Num);
    captcha.color(0, 0, 0, 0);
    captcha.color(80, 80, 80, 255);

    const img = captcha.getBase64();
    const imgBase64 = Buffer.from(img, 'base64');

    res.send(imgBase64);
}

exports.getIsAuth = (req, res) => {
   res.status(200).send({ isAuth: req.isAuthenticated() });
}