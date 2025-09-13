const Property = require('./models/property')
const { propertyValidationSchema, inquiryValidationSchema, updateUserValidationSchema } = require('./validationSchemas')
const ExpressError = require('./utils/ExpressError');
const asyncHandler = require('./utils/asyncHandler');
const User = require('./models/user');

module.exports.validateProperty = (req, res, next) => {
  const { error } = propertyValidationSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(400, msg)
  }
  next()
}

module.exports.validateUpdateUserInfo = (req,res,next)=> {
  const {error} = updateUserValidationSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(400, msg)
  }
  next()
} 

module.exports.validateInquiry = (req, res, next) => {
  const { error } = inquiryValidationSchema.validate(req.body);
  if (error) {
    console.log("validation s error")
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(400, msg)
  }
  next()
}

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectToUrl = req.originalUrl;
    req.flash('error', 'Please sign in first');
    return res.redirect('/login')
  }
  next();
};

module.exports.storeRedirectTo = (req, res, next) => {
  if (req.session.redirectToUrl) {
    res.locals.redirectToUrl = req.session.redirectToUrl;
  } else {
    // res.locals.redirectToUrl = req.get('Referer');
  }
  next();
}

module.exports.isAuthor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const property = await Property.findById(id).populate('author');
  if (!property.author.equals(req.user._id)) {
    req.flash('error', `You don't have access`)
    return res.redirect(`/properties/${id}`);
  }
  next();
})


module.exports.matchPassword = asyncHandler(async (req, res, next) => {
  const { password = '' } = req.body;
  const user = await User.findById(req.user._id);
  
  if (!user) {
    req.flash('error', 'User not found');
    return res.redirect('/settings#deleteAccount');
  }
  
  user.authenticate(password, (err, user, passwordError) => {
    if (err) {
      console.error(err);
      req.flash('error', 'An error occurred');
      return res.redirect('/settings#deleteAccount');
    }
    
    if (passwordError) {
      req.flash('error', 'Incorrect password');
      return res.redirect('/settings#deleteAccount');
    }
    
    // Password is correct, proceed to next middleware or function
    return next();
  });
})

//   user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) ...