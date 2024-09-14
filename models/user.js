const mongoose = require('mongoose')
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');
const Property = require('./property');

const imgSchema = new Schema({
  url: String,
  filename: String
});

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  fullName : {
    type: String,
    required: true
  },
  properties: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Property'
    }
  ],
  profilePicture: imgSchema
})

UserSchema.methods.getViews = async function() {
  await this.populate('properties');
  const views = this.properties.reduce((acc, property) => {
    return acc + property.views;
  }, 0);
  return views;
};

UserSchema.methods.getInquiries = async function() {
  await this.populate('properties');
 inquiries = [];
 this.properties.forEach(property => {
    inquiries.push(...property.inquiries)
 })
 return inquiries;
}


UserSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Property.deleteMany({
      _id: {
        $in: doc.properties
      }
    })
  }
})

UserSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  if (doc) {
    await Property.deleteMany({
      _id: {
        $in: doc.properties
      }
    });
  }
});

UserSchema.plugin(passportLocalMongoose) // this automatically adds username and password

module.exports = mongoose.model('User', UserSchema);