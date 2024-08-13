const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const {storeRedirectTo} = require('../middleware');
const passport = require('passport')
const User = require('../models/user')

router.get('/register', (req, res) => {
  res.render('register', {page: {title: 'register'}});
  res.end()
})

router.post('/register', asyncHandler(async (req, res, next) => {
  try {
    const { username, email, password, fullName, phoneNumber } = req.body;
    const user = new User({ username, email, password, fullName, phoneNumber });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) next(err);
      req.flash('success', `We're happy to have you ${registeredUser.username}`);
      return res.redirect('/properties');
    });
  } catch (e) {
    req.flash('error', e.message) // if user/email already registered, passport-local-mongoose throwns an error
    return res.redirect('/register');
  }
}))

router.get('/login',(req, res) => {
  return res.render('login', {page: {title: 'login'}});
})

router.post('/login',storeRedirectTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), asyncHandler(async (req, res) => {
  const redirectToUrl = res.locals.redirectToUrl || '/properties';
  console.log("redirectToUrl", redirectToUrl)
  // delete res.session.redirectToUrl; // the session is recreated when a user loged In so won't have to do that
  return res.redirect(redirectToUrl);
}))

router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    return res.redirect('/properties');
  });
})

module.exports = router;