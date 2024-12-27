const { authenticated } = require('../middlewares/auth');


module.exports.setRoutes = (app) => {
    app.use('/dashboard', authenticated, require('../routes/admin/adminRoute'));
    app.use('/dashboard', authenticated, require('../routes/admin/postRoute'))
    app.use('/dashboard', authenticated, require('../routes/admin/profileRoute'))

    app.use(require('../routes/userRoute'));
    app.use(require('../routes/blogRoute'));
    app.use('/', require('../routes/homeRoute'));


    // Handler Errors
    app.use(require('../routes/errorRoute'))
}