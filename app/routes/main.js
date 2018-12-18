module.exports = function(app, passport) {

  // home page
  app.get('/', function(req, res) {
    res.status(200).json({message:'Home Page'});
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
    res.status(200).json({message:'Profile Page'});
  });
};

// middleware to detect login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}