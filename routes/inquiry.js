const express = require('express');
const router = express.Router({mergeParams: true}); // enabling req.params because the endpoint is not in this file
const asyncHandler = require('../utils/asyncHandler')
const {validateInquiry, isLoggedIn, isAuthor} = require('../middleware');
const {createInquiry ,getInquiries, deleteInquiry} = require('../controllers/Ctrlinquiry');


router.route('/')
  .get(asyncHandler(getInquiries))
  .post(isLoggedIn, validateInquiry, asyncHandler(createInquiry))

  router.route('/:inquiryId')
  .delete(isLoggedIn, isAuthor, asyncHandler(deleteInquiry))
module.exports = router;