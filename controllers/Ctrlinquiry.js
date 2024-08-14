const express = require('express');
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');

module.exports.createInquiry = async (req, res) => {
  const property = await Property.findById(req.params.id);
  const inquiry = new Inquiry(req.body.inquiry)
  console.log(req.body.inquiry);
  if(req.isAuthenticated()){
    inquiry.author = req.user._id;
    inquiry.fullName = req.user.fullName;
    inquiry.email = req.user.email;
    inquiry.phoneNumber = req.user.phoneNumber;
  }
  property.inquiries.push(inquiry);
  await inquiry.save();
  await property.save();
  res.status(200).send({ status: 'OK' });
}

module.exports.getInquiries = async (req, res) => {
  const {id} = req.params;
  const property = await Property.findById(id);
  await property.populate('inquiries');
  res.send(property.inquiries)
}