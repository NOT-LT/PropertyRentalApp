const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Property = require('./models/property');
const mongoose = require("mongoose");
const ExpressError = require('./utils/ExpressError')
const asyncHandler = require('./utils/asyncHandler')
const {propertyValidationSchema} = require('./validationSchemas')
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

const validateProperty = (req,res,next) => {
  
  const { error } = propertyValidationSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(400, msg)
  }
}

app.get('/', asyncHandler(async (req, res) => {
  res.redirect('/properties');
}))

app.get('/properties', asyncHandler(async (req, res) => {
  const properties = await Property.find({});
  res.render('properties/index', { properties })
}))

app.get('/properties/new', (req, res) => {
  res.render('properties/new');
})

app.get('/properties/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  res.render('properties/show', { property })
}))

app.get('/properties/:id/edit', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  res.render('properties/edit', { property })
}))

app.post('/properties', validateProperty ,asyncHandler(async (req, res) => {
  const property = new Property({ ...req.body.property });
  const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
  property.images = images;
  await property.save();
  res.redirect(`/properties/${property._id}`)
}))



app.put('/properties/:id', asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.property) {
    const property = await Property.findByIdAndUpdate(id, { ...req.body.property }, { new: true });
    const images = req.body.property.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
    property.images = images;
    await property.save();
    res.redirect(`/properties/${id}`)
  } else {
    throw new ExpressError(400, "Unexpected body")
  }

}))


app.delete('/properties/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Property.findByIdAndDelete(id);
  res.redirect('/properties')
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