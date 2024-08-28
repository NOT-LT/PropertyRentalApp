const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationFeatureSchema = new Schema({
  type: { type: String, default: 'Feature' },
  geometry: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
});

const LocationFeature = mongoose.model('LocationFeature', locationFeatureSchema);
module.exports = LocationFeature;