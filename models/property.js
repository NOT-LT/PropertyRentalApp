const mongoose = require('mongoose');
const { Schema } = mongoose; // Destructuring assignment to get Schema directly

const PropertySchema = new Schema({
  title: String,
  price: String,
  image: String,
  description: String,
  location: String
});

const Property = mongoose.model('Property', PropertySchema);
module.exports = Property;
