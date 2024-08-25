const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler')
const {isLoggedIn, isAuthor, validateProperty} = require('../middleware');
const { renderIndex, renderEdit, renderShow, updateProperty, createProperty,deleteProperty } = require('../controllers/Ctrlproperties');
const multer  = require('multer')
const {storage} = require('../cloudinary') // node automaitcally looks for index.js
const upload = multer({ storage })


router.route('/')
  .get(asyncHandler(renderIndex))
  .post(isLoggedIn,upload.array('property[images]'), validateProperty, asyncHandler(createProperty))
router.get('/new',isLoggedIn, (req, res) => {
    res.render('properties/new');
})

router.route('/:id')
  .get(asyncHandler(renderShow))
  .put(isLoggedIn, isAuthor,upload.array('property[images]'),validateProperty, asyncHandler(updateProperty)) // add validateProperty
  .delete(isLoggedIn, isAuthor, asyncHandler(deleteProperty))

router.get('/:id/edit', isLoggedIn, isAuthor,  asyncHandler(renderEdit))

module.exports = router;