const express = require('express');
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');

module.exports.createInquiry = async (req, res) => {
  const property = await Property.findById(req.params.id);
  const inquiry = new Inquiry(req.body.inquiry);
  inquiry.author = req.user._id;
  property.inquiries.push(inquiry);
  await inquiry.save();
  await property.save();
  req.flash('success', 'Successfully created a new inquiry!')
  res.redirect(`/properties/${property._id}`)
}

module.exports.getInquiries = async (req, res) => {
  const property = await Property.findById(req.params.id).populate('inquiries');
  res.render('inquiries/index', { property })
}