const Joi = require('joi');
const Inquiry = require('./models/inquiry');


module.exports.propertyValidationSchema = Joi.object({
  deletedImgs: Joi.string().allow('').optional(), // this is for the images that the user wants to delete
  property: Joi.object({
    title: Joi.string().required(),
    propertyType: Joi.string().valid('flat', 'apartment', 'villa', 'camp', 'studio').required(),
    price: Joi.string().required(),
    images: Joi.string().optional(),
    description: Joi.string().optional(),
    bedrooms: Joi.string().optional(),
    bathrooms: Joi.string().optional(),
    halls: Joi.string().optional(),
    areaInSqft: Joi.string().optional(),
    garages: Joi.string().optional(),
    builtupArea: Joi.string().optional(),
    noOfFloors: Joi.string().optional(),
    noOfRoads: Joi.string().optional(),
    location: Joi.string().optional(),
    classification: Joi.string().optional(),
    postDate: Joi.date().default(Date.now).optional(),
    listingType: Joi.string().valid('sale', 'rent').required(),
    contact: Joi.string().optional(),
    propertyUsage: Joi.string().optional(),
    BFID: Joi.string().optional(),
  }).required()
});

module.exports.inquiryValidationSchema = Joi.object({
  inquiry: Joi.object({
    title: Joi.string().optional(),
    body: Joi.string().min(1).required(),
    fullName: Joi.string().optional(),
    email: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
  }).required()
});