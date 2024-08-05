const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');


const validateProperty = (req, res, next) => {
  const { error } = propertyValidationSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(400, msg)
  }
  next()
}

router.get('/', asyncHandler(async (req, res) => {
  const properties = await Property.find({});
  res.render('properties/index', { properties })
}))

router.get('/new', (req, res) => {
  res.render('properties/new');
})

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  res.render('properties/show', { property })
}))

router.get('/:id/edit', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  res.render('properties/edit', { property })
}))

router.post('/', validateProperty, asyncHandler(async (req, res) => {
  const property = new Property({ ...req.body.property });
  const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
  property.images = images;
  await property.save();
  res.redirect(`/${property._id}`)
}))




router.put('/:id', asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.property) {
    const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new: true });
    const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
    property.images = images;
    await property.save();
    res.redirect(`/${id}`)
  } else {
    throw new ExpressError(400, "Unexpected body")
  }

}))


router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Property.findByIdAndDelete(id);
  res.redirect('/properties')
}))

module.exports = router;