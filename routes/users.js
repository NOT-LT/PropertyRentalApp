const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const {storeRedirectTo} = require('../middleware');
const passport = require('passport')
const User = require('../models/user');
const {registerUser, loginUser, logoutUser, renderRegisterForm, renderLoginForm, renderProfile} = require('../controllers/Ctrlusers');

router.route('/register')
  .get(renderRegisterForm)
  .post(asyncHandler(registerUser))

router.route('/login')
  .get(renderLoginForm)
  .post(storeRedirectTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), asyncHandler(loginUser))    
  
router.get('/logout', logoutUser)

module.exports = router;