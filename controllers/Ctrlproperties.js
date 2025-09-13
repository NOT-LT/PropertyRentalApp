const express = require('express');
const ExpressError = require('../utils/ExpressError')
const Property = require('../models/property');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require('@maptiler/client');
const LocationFeature = require('../models/locationFeature');
const User = require('../models/user');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.renderIndex = async (req, res) => {
  const propertyType = req.query.propertyType;
  const listingType = req.query.listingType;
  const properties = await Property.find({propertyType: propertyType || { $exists: true } , listingType: listingType || { $exists: true }});
  res.render('properties/index', { properties, page: { title: 'indexPage' } })
};

module.exports.renderShow = async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  await property.populate('author');
  await property.populate('inquiries');
  await property.populate('geoJSON');
  property.views += 1;
  await property.save();
  // const geoLoc = maptilerClient.geocoding.forward(property?.location).then((response) => {
  // console.log(response.features[0].geometry.coordinates[0]);
  // const LF = new LocationFeature({
  //   type: 'Feature',
  //   geometry: response?.features[0]?.geometry
  // });
  // property.geoJSON = LF;
  if (!property) {
    throw new ExpressError('404', 'There is no property with this id')
  }

  res.render('properties/show', { property, page: { title: 'showPropertyPage' } })

  // }).catch((error) => {
  //   res.render('properties/show', { property, lan: 0, lon: 0, page: { title: 'showPage' } })
  // });
  // await property.save();

}


module.exports.renderEdit = async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id).populate('geoJSON');
  if (!property) {
    throw new ExpressError('404', 'There is no property with this id')
  }
  res.render('properties/edit', { property, page: { title: 'editPropertyPage' } })
}

module.exports.createProperty = async (req, res) => {
  const property = new Property({ ...req.body.property });
  property.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  property.author = req.user._id;
  let LF = new LocationFeature({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    },
    property: property?._id
  });
  if (!req?.body?.property?.longitude || !req?.body?.property?.latitude || req?.body?.property?.longitude == '' || req?.body?.property?.latitude == '') {

    try {
      let plocation = req?.body?.property?.location;
      if (!(plocation.includes('Bahrain'))) {
        plocation += ', Bahrain';
      }
      const locationResponse = await maptilerClient.geocoding.forward(plocation)
      LF = new LocationFeature({
        type: 'Feature',
        geometry: locationResponse?.features[0]?.geometry,
        property: property?._id
      });
    } catch (error) {
      console.log("couldn't forward geocode the location: ", error);
    }
  } else {
    let latitude = parseFloat(req?.body?.property?.latitude);
    let longitude = parseFloat(req?.body?.property?.longitude);
    LF = new LocationFeature({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      property: property?._id
    });
  }

  await LF.save();
  property.geoJSON = LF;
  await property.populate('geoJSON');
  await property.save();
  const user = await User.findById(req.user._id);
  user.properties.push(property);
  user.populate('properties');
  user.save();
  req.flash('success', 'Successfully created a new proeprty!')
  res.redirect(`properties/${property._id}`)
}


module.exports.deleteProperty = async (req, res) => {
  const { id } = req.params;
  await Property.findByIdAndDelete(id);
  res.redirect('/properties');
}

module.exports.updateProperty = async (req, res) => {
  const { id } = req.params;
  let { deletedImgs } = req.body;
  deletedImgs = deletedImgs.split(',').filter(img => img.length > 0);
  const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new: true });
  let newImages = req.files?.map(f => ({ url: f.path, filename: f.filename }));
  let Images = [...property?.images, ...newImages];
  if (deletedImgs !== 'undefined' && deletedImgs !== '') {
    // await property.updateOne({ $pull: { images: { filename: { $in: deletedImgs } } } });
    // Another approach to delete from mongoose

    Images = Images.filter(img => !(deletedImgs.includes(img?.filename)));

    for (let filename of deletedImgs) {
      cloudinary.uploader.destroy(filename, (error, result) => {
        if (error) {
          next(error);
        }
      });
    }
  }
  property.images = Images;
  let LF = new LocationFeature({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0]
    },
    property: property?._id
  });
 
  if (!req?.body?.property?.longitude || !req?.body?.property?.latitude || req?.body?.property?.longitude == '' || req?.body?.property?.latitude == '') {

    try {
      let plocation = req?.body?.property?.location;
      if (!(plocation.includes('Bahrain'))) {
        plocation += ', Bahrain';
      }
      const locationResponse = await maptilerClient.geocoding.forward(plocation)
      LF = new LocationFeature({
        type: 'Feature',
        geometry: locationResponse?.features[0]?.geometry,
        property: property?._id
      });
      console.log("geometry location feature :", locationResponse.features[0].geometry)
    } catch (error) {
      console.log("couldn't forward geocode the location: ", error);
    }
  } else {
    let latitude = parseFloat(req?.body?.property?.latitude);
    let longitude = parseFloat(req?.body?.property?.longitude);
    LF = new LocationFeature({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      property: property?._id
    });
  }
  await LF.save();
  property.geoJSON = LF;
  await property.populate('geoJSON');
  await property.save();
  req.flash('success', 'Successfully updated property info!')
  res.redirect(`/properties/${id}`)
}

