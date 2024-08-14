const express = require('express');
const router = express.Router({mergeParams: true}); // enabling req.params because the endpoint is not in this file
const asyncHandler = require('../utils/asyncHandler')
const {validateInquiry, isLoggedIn, isAuthor} = require('../middleware');
const {createInquiry ,getInquiries} = require('../controllers/Ctrlinquiry');


router.post('/', validateInquiry, asyncHandler(createInquiry))

router.get('/', isLoggedIn, isAuthor, asyncHandler(getInquiries))

module.exports = router;