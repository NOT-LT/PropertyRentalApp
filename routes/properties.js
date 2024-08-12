const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');
const {isLoggedIn, isAuthor, validateProperty} = require('../middleware');


router.get('/', asyncHandler(async (req, res) => {
  const properties = await Property.find({});
  res.render('properties/index', { properties })
}))

router.get('/new',isLoggedIn, (req, res) => {
  res.render('properties/new');
})

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id).populate('author');
  if (!property){
    throw new ExpressError('404', 'There is no property with this id')
  }
  res.render('properties/show', { property,  page: {title: 'showPage'}})
}))

router.get('/:id/edit', isLoggedIn, isAuthor,  asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property){
    throw new ExpressError('404', 'There is no property with this id')
  }
  res.render('properties/edit', { property })
}))

router.post('/', isLoggedIn,  validateProperty, asyncHandler(async (req, res) => {
  const property = new Property({ ...req.body.property });
  const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
  property.images = images;
  property.author = req.user._id;
  await property.save();
  req.flash('success', 'Successfully created a new proeprty!')
  res.redirect(`properties/${property._id}`)
}))




router.put('/:id',isLoggedIn, isAuthor,validateProperty, asyncHandler(async (req, res) => {
  const { id } = req.params;
    const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new: true });
    const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
    property.images = images;
    await property.save();
    req.flash('success', 'Successfully updated property info!')
    res.redirect(`/properties/${id}`)
}))


router.delete('/:id',isLoggedIn, isAuthor, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Property.findByIdAndDelete(id);
  res.redirect('/properties');
}))

module.exports = router;