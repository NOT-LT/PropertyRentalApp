const express = require('express');
const User = require('../models/user');
const Property = require('../models/property');
const { cloudinary } = require('../cloudinary');


module.exports.getUserDashboard = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const properties = await Property.find({ author: userId });
    const user = await User.findById(userId);
    const views = await user.getViews();
    const inquiries = await user.getInquiries();
    res.render('dashboard', { page: { title: 'User Dashboard' },properties, views, inquiries});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports.deleteUser = async (req, res, next) => {
  if (!req?.user?.id) {
    req.flash('error', 'You need to be logged in to delete your account');
    return res.redirect('/login');
  }

  const user = await User.findById(req?.user?.id);
  if (!user) {
    req.flash('error', 'User not found');
    return res.redirect('/properties');
  }
  if (user.profilePicture?.filename){
    await cloudinary.uploader.destroy(user.profilePicture?.filename, (error, result) => {
      if (error) {
        next(error);
      }
    });
  }
  await user.deleteOne();
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'We are sorry to see you leave');
    return res.redirect('/properties');
  });
 
}

module.exports.getUserSettings = async (req, res, next)=> {
  const user = await User.findById(req?.user?.id);
  res.render('userSettings', { user });   
}

module.exports.postUserSettings = async (req,res,next) => {
  const user = await User.findById(req?.user?.id);
  user.email = req.body.email;
  user.fullName = req.body.fullName;
  if (req.file){
    // console.log('ctrlUsers - req files: ', req.files);
    if (user?.profilePicture?.filename){
      await cloudinary.uploader.destroy(user.profilePicture?.filename, (error, result) => {
        if (error) {
          next(error);
        }
      });
    }
    const profilePicture = { url: req.file?.path, filename: req.file?.filename }
    user.profilePicture = profilePicture;
  }
  await user.save();
  req.flash('success', 'info updated successfully')
  return res.status(200).redirect('/settings');
}

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phoneNumber } = req.body;

    const user = new User({ username, email, password, fullName, phoneNumber, profilePicture: { url: 'https://res.cloudinary.com/ds9e2dvrv/image/upload/v1736102014/PropertyRentalApp/nhry0p2v1f9mmyfvjthf.webp', filename: 'PropertyRentalApp/nhry0p2v1f9mmyfvjthf' } });
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
}

module.exports.loginUser = async (req, res) => {
  req.flash('success', `Welcome back ${req.user.username}`);
  const redirectToUrl = res.locals.redirectToUrl || '/properties';
  return res.redirect(redirectToUrl);
}

module.exports.logoutUser = async (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    return res.redirect('/properties');
  });
}

module.exports.renderRegisterForm = async (req, res) => {
  res.render('register', { page: { title: 'register' } });
}

module.exports.renderLoginForm = async (req, res) => {
  return res.render('login', { page: { title: 'login' } });
}

module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.params.id).populate('properties');
  res.render('users/profile', { user });
}