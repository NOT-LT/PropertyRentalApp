const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');
const {isLoggedIn, isAuthor, validateProperty} = require('../middleware');
const { renderIndex, renderEdit, renderShow, updateProperty, createProperty,deleteProperty } = require('../controllers/Ctrlproperties');


router.route('/')
  .get(asyncHandler(renderIndex))
  .post(isLoggedIn, validateProperty, asyncHandler(createProperty))

router.get('/new',isLoggedIn, (req, res) => {
    res.render('properties/new');
})

router.route('/:id')
  .get(asyncHandler(renderShow))
  .put(isLoggedIn, isAuthor, validateProperty, asyncHandler(updateProperty))
  .delete(isLoggedIn, isAuthor, asyncHandler(deleteProperty))

router.get('/:id/edit', isLoggedIn, isAuthor,  asyncHandler(renderEdit))

module.exports = router;