
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const debug = require('debug')('weblog');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');

const connectDB = require('./config/db');
const { setStatics } = require('./utils/statics');
const { setRoutes } = require('./utils/routes');
const winston = require('./config/winston');

// config env
dotEnv.config({ path: './config/config.env' });

// Database Connection
connectDB();

// passport Configuration
require('./config/passport');

// initialize app
const app = new express();

// using helmet for toping security
// app.use(helmet());

// Morgan Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined', {
        stream: winston.stream
    }));
}

// config body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// use express-fileUpload
app.use(fileUpload());  // req.files

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    // cookie: {
    //     maxAge: null
    // },
    resave: false,
    unset: 'destroy',
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // remember me
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash()); // req.flash

// View engine
app.use(expressLayout); // use Layouts
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/mainLayout');
app.set('layout extractScripts', true); // use script to end layout!

// Static
setStatics(app);

// Routes
setRoutes(app);

// app Run
app.listen(process.env.PORT, () => {
    debug(`app is Running in ${process.env.NODE_ENV}`)
});