const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError')
const asyncHandler = require('./utils/asyncHandler')
const Property = require('./models/property');
const Inquiry = require('./models/inquiry');
const mongoose = require("mongoose");

const propertiesRoute = require('./routes/properties')
const inquiriesRoute = require('./routes/inquiry')
mongoose.connect('mongodb://localhost:27017/propertyRentalApp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
})

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'));

app.use('/properties/:id/inquiry', inquiriesRoute)
app.use('/properties', propertiesRoute)

app.get('/', asyncHandler(async (req, res) => {
  res.redirect('/properties');
}))

app.all('*', (req, res, next) => {
  throw new ExpressError(404, 'Not Found')
})
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'error occured' } = err;
  const stack = err.stack;
  console.log(statusCode, message)
  res.status(statusCode).render('error', { statusCode, message, stack })
})



app.listen(1111, () => {
  console.log("Listening at port 3000");
})