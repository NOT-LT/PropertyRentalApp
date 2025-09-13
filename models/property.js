const mongoose = require('mongoose');
const Inquiry = require('./inquiry');
const User = require('./user');
const LocationFeature = require('./locationFeature');
const { cloudinary } = require('../cloudinary');
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
  views: {
    type: Number,
    default: 0
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
    await User.updateOne({
      _id: doc.author
    }, {
      $pull: {
        properties: doc._id
      }
    })
  }
})

PropertySchema.pre('deleteMany', async function (next) {
  const properties = await this.model.find(this.getFilter());
  const propertyIds = properties.map(property => property._id);
  await Inquiry.deleteMany({ _id: { $in: propertyIds } });
  await LocationFeature.deleteMany({ _id: { $in: propertyIds } });
  Array.from(properties).forEach(async property => {
    const images = property?.images;
    for (let img of images) {
      await cloudinary.uploader.destroy(img?.filename, (error, result) => {
        if (error) {
          next(error);
        }
      });
    }
  });
  // await User.updateMany({
  //   properties: { $in: propertyIds }
  // }, {
  //   $pull: {
  //     properties: { $in: propertyIds }
  //   }
  // })
  next();
});
PropertySchema.index({ title: 'text', propertyType:'text',description: 'text',price:'text',geoJSON:'text' });

const Property = mongoose.model('Property', PropertySchema);
module.exports = Property;
