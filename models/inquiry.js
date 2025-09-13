const mongoose = require('mongoose')
const { Schema } = mongoose;

const inquirySchema = new Schema({
  title: {
    type: String
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Inquiry = mongoose.model('Inquiry', inquirySchema)

module.exports = Inquiry;