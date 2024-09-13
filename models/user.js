const mongoose = require('mongoose')
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

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
  ]
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
  console.log("user.js - p: " + property)
  console.log("user.js - p inq: " + property.inquiries)
    inquiries.push(...property.inquiries)
 })
 return inquiries;
}

UserSchema.plugin(passportLocalMongoose) // this automatically adds username and password

module.exports = mongoose.model('User', UserSchema);