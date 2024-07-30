const Joi = require('joi');


module.exports.propertyValidationSchema = Joi.object({
  property: Joi.object({
    title: Joi.string().required(),
    propertyType: Joi.string().valid('flat', 'apartment', 'villa', 'camp', 'studio').required(),
    price: Joi.string().required(),
    images: Joi.array().items(Joi.string()).optional(),
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