const express = require('express');
const router = express.Router({mergeParams: true});
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');
const {inquiryValidationSchema} = require('../validationSchemas')

const validateInquiry = (req, res, next) => {
  const { error } = inquiryValidationSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(400, msg)
  }
  next()
}

router.post('/', validateInquiry, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  const inquiry = new Inquiry(req.body.inquiry)
  property.inquiries.push(inquiry);
  await inquiry.save();
  await property.save();
  res.status(200).send({ status: 'OK' });
}))

router.get('/', asyncHandler(async(req,res)=> {
  const {id} = req.params;
  const property = await Property.findById(id);
  await property.populate('inquiries');
  res.send(property.inquiries)
}))

module.exports = router;