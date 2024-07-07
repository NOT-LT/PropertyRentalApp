const express = require('express');
const path = require('path');
const Property = require('./models/property');
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/propertyRentalApp',
  {
    useNewUrlParser: true, // Some are missing
    useUnifiedTopology: true
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
  console.log("Database connected");
})

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req,res)=> {
  const prop1 = new Property({title: 'First Property', price: 99999});
  await prop1.save();
  res.send(prop1);
})

app.listen(3000, ()=> {
  console.log("Listening at port 3000");
})