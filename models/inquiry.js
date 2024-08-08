const mongoose = require('mongoose')
const {Schema} = mongoose;

const inquirySchema = new Schema({
  body: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: false
  }
})

const Inquiry = mongoose.model('Inquiry', inquirySchema)

module.exports = Inquiry;