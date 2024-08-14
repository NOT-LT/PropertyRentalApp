const express = require('express');
const ExpressError = require('../utils/ExpressError')
const Property = require('../models/property');

module.exports.renderIndex = async (req, res) => {
  const properties = await Property.find({});
  res.render('properties/index', { properties })
};

module.exports.renderShow = async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id).populate('author');
  if (!property){
    throw new ExpressError('404', 'There is no property with this id')
  }
  res.render('properties/show', { property,  page: {title: 'showPage'}})
}

module.exports.renderEdit = async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property){
    throw new ExpressError('404', 'There is no property with this id')
  }
  res.render('properties/edit', { property,  page: {title: 'editPage'}})
}

module.exports.createProperty = async (req, res) => {
  const property = new Property({ ...req.body.property });
  const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
  property.images = images;
  property.author = req.user._id;
  await property.save();
  req.flash('success', 'Successfully created a new proeprty!')
  res.redirect(`properties/${property._id}`)
}


module.exports.deleteProperty = async (req, res) => {
  const { id } = req.params;
  await Property.findByIdAndDelete(id);
  res.redirect('/properties');
}

module.exports.updateProperty = async (req, res) => {
  const { id } = req.params;
    const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new: true });
    const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
    property.images = images;
    await property.save();
    req.flash('success', 'Successfully updated property info!')
    res.redirect(`/properties/${id}`)
}
