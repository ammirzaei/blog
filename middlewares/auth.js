exports.authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    req.flash('Error', 'ابتدا باید با حساب خود وارد شوید');
    const url = req.originalUrl;
    if (url === '/logout') {
        return res.redirect('/');
    }
    res.redirect(`/login?redirect=${url}`);
}