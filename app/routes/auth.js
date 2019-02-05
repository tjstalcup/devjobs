module.exports = function(app, passport) {

  // process the login form
  app.post('/login', passport.authenticate('local-login',{
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }));

  

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup',{
    successRedirect: '/dashboard',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  app.get('/auth/linkedin', passport.authenticate('linkedin'));

  app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { 
      successRedirect: '/dashboard',
      failureRedirect: '/' 
  }));

  // logout
  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });
};

// middleware to detect login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}