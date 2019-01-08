var User = require('../models/user');


module.exports = function(app, passport) {

  // home page
  app.get('/', function(req, res) {
    res.status(200).json({message:'Home Page Message'});
  });

  // show the login form
  app.get('/login', function(req, res) {
    res.status(200).json({message:'Login Page'});
  });

  // show the signup form
  app.get('/signup', function(req, res) {
    res.status(200).json({message:'Signup Page'});
  });

  app.get('/profile', isLoggedIn, function(req, res) {
    res.status(200).json({message:'Profile Page',user:req.user});
  });

  // Temp Routes - just for testing

  app.get('/users', (req,res)=>{
    User.find()
      .then((users)=>res.send(users))
      .catch(errorHandler);
  });

};

// middleware to detect login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}

// route middleware to make sure a user is logged in as an admin
function isAdmin(req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated() && req.user.level == 'admin')
      return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

function errorHandler(err){
  console.error(err);
}