var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// week 2 - mongodb atlas
var configDB = require('./config/database.js'); 
mongoose.connect(configDB.url); 

// week 2 - authentication
require('./config/passport')(passport);

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser()); 

// week 5 - template
// app.set('view engine', 'ejs'); 

// week 2 - authentication
app.use(session({ secret: 'thinkful-8-temp' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); // sending session based messages between views

// routes ======================================================================
require('./app/routes/main.js')(app, passport); 
require('./app/routes/auth.js')(app, passport); 
// additional routes will come in as needed

// launch ======================================================================
app.listen(port);
console.log('Your app is running at http://localhost:' + port);