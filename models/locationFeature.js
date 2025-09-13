const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationFeatureSchema = new Schema({
  type: { type: String, default: 'Feature' },
  geometry: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property'
  }
});

const LocationFeature = mongoose.model('LocationFeature', locationFeatureSchema);
locationFeatureSchema.index({ geometry: '2dsphere' });

module.exports = LocationFeature;