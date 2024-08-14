const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const Property = require('../models/property');
const Inquiry = require('../models/inquiry');
const {isLoggedIn, isAuthor, validateProperty} = require('../middleware');
const { renderIndex, renderEdit, renderShow, updateProperty, createProperty,deleteProperty } = require('../controllers/Ctrlproperties');


router.get('/', asyncHandler(renderIndex))

router.get('/new',isLoggedIn, (req, res) => {
  res.render('properties/new');
})

router.get('/:id', asyncHandler(renderShow))

router.get('/:id/edit', isLoggedIn, isAuthor,  asyncHandler(renderEdit))

router.post('/', isLoggedIn,  validateProperty, asyncHandler(createProperty))


router.put('/:id',isLoggedIn, isAuthor,validateProperty, asyncHandler(updateProperty))


router.delete('/:id',isLoggedIn, isAuthor, asyncHandler(deleteProperty))

module.exports = router;