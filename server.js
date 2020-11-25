const express = require('express');
const dotenv = require('dotenv')
const path = require('path')
const ejs = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const morgan = require('morgan');
const passport = require('passport');
const flash = require('connect-flash')
const session = require('express-session');

//express init
const app = express();

//config
dotenv.config({path: './config/config.env'});

//passport config
require('./config/passport')(passport);

//connect DB
connectDB(); 

//body-parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
}))


//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//connect flash
app.use(flash());

//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//morgan
app.use(morgan('dev'));

//passport middlewre
app.use(passport.initialize());
app.use(passport.session());

//public folder
app.use(express.static(path.join(__dirname, 'public')))

//EJS
app.use(ejs);
app.set('view engine', 'ejs');
app.set('layout', path.join(__dirname, 'views'));
app.set('layout_register', 'layout_login');


//routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

//PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running '+PORT))