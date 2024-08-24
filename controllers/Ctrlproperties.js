const express = require('express');
const ExpressError = require('../utils/ExpressError')
const Property = require('../models/property');
const {cloudinary} = require('../cloudinary');

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
  console.log(req.body)
  console.log(req.body.property.images)
  const property = new Property({ ...req.body.property });
  // const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
  property.images = req.files.map(f=> ({url : f.path, filename: f.filename}));
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
  let {deletedImgs} = req.body;
  deletedImgs = deletedImgs.split(',').filter(img => img.length > 0);
  const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new: true });
  let newImages = req.files?.map(f=> ({url : f.path, filename: f.filename}));
  let Images = [...property?.images, ...newImages];
  if (deletedImgs !== 'undefined' && deletedImgs !== '') {
    // await property.updateOne({ $pull: { images: { filename: { $in: deletedImgs } } } });
    // Another approach to delete from mongoose

    Images = Images.filter(img => !(deletedImgs.includes(img?.filename)));

    for (let filename of deletedImgs) {
      cloudinary.uploader.destroy(filename, (error,result) => {
      if (error) {
        next(error);
      }
      });
    }
  }
  property.images = Images;

    await property.save();
    req.flash('success', 'Successfully updated property info!')
    res.redirect(`/properties/${id}`)
}
