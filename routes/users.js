const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const {storeRedirectTo} = require('../middleware');
const passport = require('passport')
const User = require('../models/user');
const {registerUser, loginUser, logoutUser, renderRegisterForm, renderLoginForm, getUserDashboard} = require('../controllers/Ctrlusers');
const {isLoggedIn} = require('../middleware');
router.route('/register')
  .get(asyncHandler(renderRegisterForm))
  .post(asyncHandler(registerUser))

router.route('/login')
  .get(asyncHandler(renderLoginForm))
  .post(storeRedirectTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), asyncHandler(loginUser))    
  

router.get('/dashboard', isLoggedIn, asyncHandler(getUserDashboard));


router.get('/logout', asyncHandler(logoutUser))

module.exports = router;