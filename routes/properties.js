const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler')
const { isLoggedIn, isAuthor, validateProperty } = require('../middleware');
const { renderIndex, renderEdit, renderShow, updateProperty, createProperty, deleteProperty } = require('../controllers/Ctrlproperties');
const multer = require('multer')
const { storage } = require('../cloudinary');
const Property = require('../models/property');
const LocationFeature = require('../models/locationFeature');
const upload = multer({ storage })


router.route('/')
  .get(asyncHandler(renderIndex))
  .post(isLoggedIn, upload.array('property[images]'), validateProperty, asyncHandler(createProperty))

router.get('/coordinates/:lon/:lat', asyncHandler(async (req, res) => {
  const lon = parseFloat(req.params.lon);
  const lat = parseFloat(req.params.lat);

  const locationFeature = await LocationFeature.findOne({
    geometry: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lon, lat]
        },
        $maxDistance: 10000 // Optional: specify a maximum distance in meters
      }
    }
  });

  if (!locationFeature) {
    return res.status(404).send('Location feature not found');
  }

  await locationFeature.populate('property');
  res.send(locationFeature.property);
}));

router.get('/new', isLoggedIn, (req, res) => {
  res.render('properties/new');
})

router.route('/:id')
  .get(asyncHandler(renderShow))
  .put(isLoggedIn, isAuthor, upload.array('property[images]'), validateProperty, asyncHandler(updateProperty)) // add validateProperty
  .delete(isLoggedIn, isAuthor, asyncHandler(deleteProperty))

router.get('/:id/edit', isLoggedIn, isAuthor, asyncHandler(renderEdit))

module.exports = router;