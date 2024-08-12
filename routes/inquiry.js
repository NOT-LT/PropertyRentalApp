const express = require('express');
const router = express.Router({mergeParams: true}); // enabling req.params because the endpoint is not in this file
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');
const {validateInquiry, isLoggedIn, isAuthor} = require('../middleware');



router.post('/', isLoggedIn, validateInquiry, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  const inquiry = new Inquiry(req.body.inquiry)
  inquiry.author = req.user._id;
  property.inquiries.push(inquiry);
  await inquiry.save();
  await property.save();
  res.status(200).send({ status: 'OK' });
}))

router.get('/', isLoggedIn, isAuthor, asyncHandler(async(req,res)=> {
  const {id} = req.params;
  const property = await Property.findById(id);
  await property.populate('inquiries');
  res.send(property.inquiries)
}))

module.exports = router;