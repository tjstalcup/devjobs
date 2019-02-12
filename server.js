var express  = require('express');
var app      = express();
require('run-middleware')(app);
var PORT     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var cron = require('node-cron');

// week 2 - mongodb atlas
var configDB = require('./config/database.js'); 
// mongoose.connect(configDB.url); 

app.use(express.static('public'));

// week 2 - authentication
require('./config/passport')(passport);

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser()); 

// week 5 - template
app.set('view engine', 'ejs'); 

// week 2 - authentication
app.use(session({ secret: 'thinkful-8-temp' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); // sending session based messages between views

// routes ======================================================================
require('./app/routes/main.js')(app, passport); 
require('./app/routes/auth.js')(app, passport); 
// additional routes will come in as needed

cron.schedule('* */1 * * *', () => {
  app.runMiddleware('/call-jobs',{connection: {}},(code,body,headers)=>{
    //console.log('cron response:',body);
    // console.log('response');
  });
});

let server; // create this globally so we can start and stop the server

function runServer(databaseURL = configDB.url, port = PORT){
  // passing in a databseURL, if empty, use the default in config/database.js
  // passing in a port, if empty, use the default port (process.env or 8080)

  // we want this function to return a promise so we can handle rejection in our test file
  return new Promise((resolve, reject) => {
    // let's start by connecting to the DB
    mongoose.connect(databaseURL, err => {
      if(err){
        // reject if that doesn't work
        return reject(err);
      }

      // now let's start the server
      server = app.listen(port, ()=>{
        console.log(`~~~~DevJobs is running on port ${port}~~~~`);
        // resolve if both the DB and Server work
        resolve();
      })
      .on('error', err => {
        // app.listen is a promise that will emit an error event if something goes wrong
        //disconnect the db and reject w/ error
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer(){
  mongoose.disconnect();

  return new Promise((resolve,reject)=>{
    console.log('~~~~DevJobs Server is shutting down~~~~');

    server.close(err=>{
      if(err){
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// now if we don't call this from a test file, but rather from npm start, nodemon, node server.js, etc.
// we have to manually start the server with our new function

// require.main is what file required this
// module is this file
// so if they are the same, start the server
if(require.main === module){
  runServer(configDB.url).catch(err=>console.error(err));
}

module.exports = {app, runServer, closeServer};


// launch ======================================================================
// app.listen(port);
// console.log('Your app is running at http://localhost:' + port);