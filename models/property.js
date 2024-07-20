const mongoose = require('mongoose');
const { Schema } = mongoose; // Destructuring assignment to get Schema directly

const PropertySchema = new Schema({
  title: String,
  propertyType: {
    type: String,
    enum: ['flat', 'apartment', 'villa', 'camp', 'studio'],
    required: true
  },
  price: String,
  images: [String],
  description: String,
  bedrooms: String,
  bathrooms: String,
  halls: String,
  areaInSqft: String,
  garages: String,
  builtupArea: String,
  noOfFloors: String,
  noOfRoads: String,
  location: String,
  classification: String,
  postDate: {
    type: Date,
    default: Date.now
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  contact: String,
  propertyUsage: String,
  BFID: String,

});


const Property = mongoose.model('Property', PropertySchema);
module.exports = Property;
