const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Property = require('../models/property');
const axios = require('axios')

// Database connection
mongoose.connect('mongodb://localhost:27017/propertyRentalApp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const cities = [
  'Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'A\'ali', 'Isa Town', 'Sitra', 'Budaiya', 'Jidhafs', 'Zallaq'
];

const governorates = [
  'Capital Governorate', 'Northern Governorate', 'Southern Governorate', 'Muharraq Governorate'
];

const types = [
  'flat', 'apartment', 'villa', 'studio', 'townhouse', 'duplex', 'farmhouse'
];

const getRandomPrice = (type) => {
  switch (type) {
    case 'flat':
    case 'studio':
    case 'apartment':
      return faker.number.int({ min: 120, max: 600 });
    case 'villa':
    case 'penthouse':
    case 'townhouse':
      return faker.number.int({ min: 600, max: 1200 });
    default:
      return faker.number.int({ min: 120, max: 1200 });
  }
};

const seedDB = async () => {
  await Property.deleteMany({}); // Clear existing data

  for (let i = 0; i < 50; i++) {
    const type = faker.helpers.arrayElement(types);
    const price = getRandomPrice(type);

    const property = new Property({
      title: `${faker.commerce.productAdjective()} ${type}`,
      price: price.toString(),
      description: faker.lorem.paragraph(),
      image: `https://picsum.photos/1024?random=${Math.random()*100}`,
      location: `${faker.helpers.arrayElement(cities)}`
    });

    await property.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
