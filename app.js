const express = require('express');
const path = require('path');
const expressSession = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError')
const asyncHandler = require('./utils/asyncHandler')
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
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'));
const sessionConfig = {
  secret: 'changeMeLater',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(expressSession(sessionConfig))
app.use(flash())
app.use((req,res,next)=> {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

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