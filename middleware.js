module.exports.isLoggedIn = (req,res,next) => {
  if (!req.isAuthenticated()){
    req.session.redirectToUrl = req.originalUrl; // add this line
    req.flash('error', 'Please sign in first');
    return res.redirect('/login')
  }
  next();
};

module.exports.storeRedirectTo = (req,res,next)=> {
  if (req.session.redirectToUrl){
    res.locals.redirectToUrl = req.session.redirectToUrl;
  }
  next();
}