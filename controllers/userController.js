const User = require('../models/userModel');
const { get500, get404 } = require('./errorController');

const fetch = require('node-fetch');
const passport = require('passport');
const urlLocal = require('url-local');
const jwt = require('jsonwebtoken');

// Login -- GET
module.exports.getLogin = (req, res) => {
    if (req.isAuthenticated())
        return res.redirect('/');

    // set header for clear backward
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    res.render('users/login', {
        pageTitle: 'صفحه ورود',
        path: '/user',
        layout: './layouts/usersLayout',
        success: req.flash('Success'),
        error: req.flash("Error"),
        redirect: req.query.redirect
    });
}

// Login Handle -- POST
module.exports.handleLogin = async (req, res, next) => {
    try {
        const resRecaptcha = req.body['g-recaptcha-response'];

        if (!resRecaptcha) {
            req.flash('Error', 'CAPTCHA را تایید کنید');
            return res.redirect('/login');
        }
        if (reChaptcha(resRecaptcha, req.ip)) {
            const urlRedirect = req.body.redirect.trim();
            passport.authenticate('local', {
                failureRedirect: '/login',
                failureFlash: true,
                successRedirect: urlLocal(urlRedirect) ? urlRedirect : '/'
            })(req, res, next);
        } else {
            req.flash('Error', 'اعتبارسنجی CAPTCHA موفقیت آمیز نبود');
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        get500(req, res);
    }
};

// Get response in google recaptcha
async function reChaptcha(resRecaptcha, remoteIp) {
    const verify = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${resRecaptcha}&remoteip=${remoteIp}`;

    const response = await fetch(verify, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    });
    const resJson = await response.json();
    return resJson.success;
}

// RememberMe Handle -- POST
exports.handleRememberMe = (req, res) => {
    if (req.body.remember) {
        req.session.cookie.originalMaxAge = (3600 * 1000) * 24 * 7; // 7 day
    } else {
        req.session.cookie.expire = null;
    }

    res.redirect('/dashboard');
}

// Logout Handle -- GET
module.exports.handleLogout = (req, res) => {
    req.session = null;
    req.logout((err) => {
        if (err) console.log(err);

        // set header for clear backward
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        res.redirect('/');
    });
}

// Register -- GET
module.exports.getRegister = (req, res) => {
    res.render('users/register', {
        pageTitle: 'صفحه ثبت نام',
        path: '/user',
        layout: './layouts/usersLayout',
        errors: [],
        success: req.flash('Success'),
        error: req.flash('Error')
    });
}

// Register -- POST
module.exports.postRegister = async (req, res) => {
    const errors = [];
    try {
        const resRecaptcha = req.body['g-recaptcha-response']; // access to the recaptcha response

        if (!resRecaptcha) {
            req.flash('Error', 'CAPTCHA را تایید کنید');
            return res.redirect('/register');
        }

        if (!reChaptcha(resRecaptcha, req.ip)) {
            req.flash('Error', 'اعتبارسنجی CAPTCHA موفقیت آمیز نبود');
            res.redirect('/register');
        }

        await User.userValidation(req.body);
        const { fullName, email, password } = req.body;

        const user = await User.findOne({ email });
        if (user) {
            errors.push({
                name: 'email',
                message: 'ایمیل وارد شده تکراری است'
            });
            return res.render('users/register', {
                pageTitle: 'صفحه ثبت نام',
                path: '/user',
                layout: './layouts/usersLayout',
                errors,
                success: req.flash('Success'),
                error: req.flash('Error')
            });
        }

        // const hash = await bcrypt.hash(password, 10);
        await User.create({
            fullName,
            email,
            password,
            avatar: 'user.png',
            bio: "",
            follower: 0,
        });

        // send Email for welcome

        req.flash('Success', 'ثبت نام شما با موفقیت انجام شد');
        res.redirect('/login');


        // bcrypt.genSalt(10, (err, salt) => {
        //     if (err) throw err;
        //     bcrypt.hash(password, salt, async (err, hash) => {
        //         if (err) throw err;
        //         await User.create({
        //             fullName,
        //             email,
        //             password: hash
        //         });
        //         res.redirect('/login');
        //     });
        // });

        // // database code
        // const userN = new User({ // instance from user
        //     fullName : req.body.fullName,
        //     email : req.body.email,
        //     password : req.body.password
        // });
        // await userN.save().then(()=>{
        //     res.redirect('/login');
        // });
    } catch (err) {
        err.inner.forEach(error => {
            errors.push({
                name: error.path,
                message: error.message
            });
        });

        return res.render('users/register', {
            pageTitle: 'صفحه ثبت نام',
            path: '/user',
            layout: './layouts/usersLayout',
            errors,
            success: req.flash('Success'),
            error: req.flash('Error')
        });
    }
}

// Forget Password -- GET
module.exports.getForgetPassword = (req, res) => {
    if (req.isAuthenticated())
        return res.redirect('/');

    res.render('users/forgetPassword', {
        pageTitle: 'فراموشی رمز عبور',
        path: '/user',
        layout: './layouts/usersLayout',
        success: req.flash('Success'),
        error: req.flash('Error'),
    });
}

// Forget Password -- POST
exports.handleForgetPassword = async (req, res) => {
    try {
        const resRecaptcha = req.body['g-recaptcha-response']; // access to the recaptcha response

        if (!resRecaptcha) {
            req.flash('Error', 'CAPTCHA را تایید کنید');
            return res.redirect('/forget-password');
        }

        if (!reChaptcha(resRecaptcha, req.ip)) {
            req.flash('Error', 'اعتبارسنجی CAPTCHA موفقیت آمیز نبود');
            return res.redirect('/forget-password');
        }

        const { email } = req.body; // access to the email input

        const user = await User.findOne({ email }); // find user with email

        if (user) {
            // create token with jwt
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });

            const resetLink = `http://localhost:3000/reset-password/${token}`; // create resetlink

            // send email to email user
            console.log(resetLink);

            req.flash('Success', 'ایمیلی حاوی تغییر رمز عبور برای شما ارسال شد.');
            res.redirect('/forget-password');
        } else {
            req.flash('Error', 'کاربری با ایمیل وارد شده یافت نشد');
            return res.redirect('/forget-password');
        }

    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

// Reset Password -- GET
module.exports.getResetPassword = async (req, res) => {
    let decodedToken;
    try {
        const token = req.params.token; // access to the token

        decodedToken = jwt.verify(token, process.env.JWT_SECRET); // auth token

        res.render('users/resetPassword', {
            pageTitle: 'ریست رمز عبور',
            path: '/user',
            success: req.flash('Success'),
            error: req.flash('Error'),
            userId: decodedToken.userId,
            errors: []
        });
    } catch (err) {
        if (!decodedToken) {
            get404(req, res); // invalid token
        }

        console.log(err);
        get500(req, res);
    }
}

// Reset Password -- POST
exports.handleResetPassword = async (req, res) => {
    const userId = req.params.id; // access to the user id

    try {
        await User.resetPasswordValidation(req.body); // validation

        const user = await User.findById(userId); // find user

        if (!user)
            get404(req, res);

        user.password = req.body.password; // replace new password
        await user.save();

        req.flash('Success', 'رمز عبور با موفقیت تغییر یافت');
        res.redirect('/login');

    } catch (err) {
        const errors = [];

        err.inner.forEach((error) => {
            errors.push({
                name: error.path,
                message: error.message
            });
        });

        res.render('users/resetPassword', {
            pageTitle: 'ریست رمز عبور',
            path: '/user',
            errors,
            success: req.flash('Success'),
            error: req.flash('Error'),
            userId
        });
    }
}