const mongoose = require('mongoose');
const Inquiry = require('./inquiry');
const LocationFeature = require('./locationFeature');
const { Schema } = mongoose; // Destructuring assignment to get Schema directly


const imgSchema = new Schema({
  url: String,
  filename: String
});

imgSchema.virtual('thumbnail1')
  .get(function () {
    return this.url.replace('/upload', '/upload/w_250');
  })

imgSchema.virtual('thumbnail2')
  .get(function () {
    return this.url.replace('/upload', '/upload/w_720');
  })

const PropertySchema = new Schema({
  title: String,
  propertyType: {
    type: String,
    enum: ['flat', 'apartment', 'villa', 'camp', 'studio'],
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  price: String,
  images: [
    imgSchema
  ],
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
    default: Date.now()
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  contact: String,
  propertyUsage: String,
  inquiries: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Inquiry'
    }
  ],
  geoJSON: {
    type: Schema.Types.ObjectId,
    ref: 'LocationFeature'
  },
  BFID: String
});

function addCommasToNumberInString(str) {
  return str.replace(/\d+/g, function (match) {
    return Number(match).toLocaleString();
  });
}

PropertySchema.pre('save', function (next) {
  this.price = addCommasToNumberInString(this.price.replace(',', ''))
  if (!this.price.includes('BHD')) {
    if (this.listingType === 'rent') {
      this.price += ' BHD/month';
    } else {
      this.price += ' BHD';
    }
  }
  next();
});

PropertySchema.post('findOneAndDelete', async function (doc) { // this will be hit even for findByIdAndDelete
  if (doc) {
    await Inquiry.deleteMany({
      _id: {
        $in: doc.inquiries
      }
    });
    await LocationFeature.deleteOne({
      _id: doc.geoJSON
    })
  }
})
const Property = mongoose.model('Property', PropertySchema);
module.exports = Property;
