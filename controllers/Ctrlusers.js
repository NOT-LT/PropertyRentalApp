const express = require('express');
const User = require('../models/user');
const Property = require('../models/property');

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const properties = await Property.find({ author: userId });
    const user = await User.findById(userId);
    const views = await user.getViews();
    const inquiries = await user.getInquiries();
    console.log("inq:", inquiries);
    res.render('dashboard', { page: { title: 'User Dashboard' },properties, views, inquiries});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports.registerUser = async (req, res, next) => {
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