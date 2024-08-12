const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Property = require('../models/property');

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

const types = [
  'flat', 'apartment', 'villa', 'camp', 'studio'
];

const authors = ['66b9cded190906e2df86f637', '66b9cd81190906e2df86f630']

const listingTypes = [
  'sale', 'rent'
];

const propertyUsages = [
  'Industrial', 'Commerce', 'Apartments', 'Retail', 'Office', 'Agriculture', 'Residential'
];

const classificationMapping = {
  'Residential': ['RA', 'RB', 'RHA', 'RHB', 'RG'],
  'Industrial': ['S'],
  'Commerce': ['BA', 'BB', 'BC'],
  'Apartments': ['BA', 'BB', 'BC'],
  'Retail': ['BA', 'BB', 'BC'],
  'Office': ['BA', 'BB', 'BC'],
  'Agriculture': ['AG']
};


const getRandomPrice = (type, listingType) => {
  if (listingType === 'sale') {
    switch (type) {
      case 'flat':
      case 'studio':
      case 'apartment':
        return Math.round(faker.number.int({ min: 45000, max: 110000 }) / 100) * 100; // to get a number with 0 in ones and tens
      case 'villa':
      case 'camp':
        return Math.round(faker.number.int({ min: 100000, max: 780000 }) / 100) * 100;
      default:
        return Math.round(faker.number.int({ min: 45000, max: 780000 }) / 100) * 100;
    }
  } else {
    switch (type) {
      case 'flat':
      case 'studio':
      case 'apartment':
        return faker.number.int({ min: 120, max: 600 });
      case 'villa':
      case 'camp':
        return faker.number.int({ min: 600, max: 1200 });
      default:
        return faker.number.int({ min: 120, max: 1200 });
    }
  }
};

// Function to generate a random contact number
const generateContactNumber = () => {
  const prefix = '+973';
  const startDigit = faker.helpers.arrayElement(['3', '6']);
  const number = `${startDigit}${faker.number.int({ min: 1000000, max: 9999999 })}`;
  return `${prefix}${number}`;
};

const generateFloors = (type) => {
  switch (type) {
    case 'flat':
    case 'studio':
    case 'apartment':
      return faker.number.int({ min: 1, max: 2 });
    case 'villa':
      return faker.number.int({ min: 1, max: 4 });
    case 'camp':
      return 1
    default:
      return faker.number.int({ min: 1, max: 3 });
  }
}

const getImages = () => {
  arr = []
  const n = faker.number.int({ min: 3, max: 6 });
  for (let i = 0; i < n; i++) {
    arr[i] = `https://picsum.photos/seed/${faker.number.int({ min: 1, max: 9999 })}/1280/720`
  }
  return arr;
}

const seedDB = async () => {
  await Property.deleteMany({}); // Clear existing data

  for (let i = 0; i < 54; i++) {
    const listingType = faker.helpers.arrayElement(listingTypes);
    const type = faker.helpers.arrayElement(types);
    const author = faker.helpers.arrayElement(authors);
    const usage = faker.helpers.arrayElement(propertyUsages);
    const classificationOptions = classificationMapping[usage];
    const classification = faker.helpers.arrayElement(classificationOptions);
    const nFloors = generateFloors(type);
    const Rimages = getImages();
    let price = getRandomPrice(type, listingType).toLocaleString();
    const contact = generateContactNumber(); // Generate the contact number
    const Nbedrooms = faker.number.int({ min: 1, max: 10 });
    const property = new Property({
      title: `${faker.commerce.productAdjective()} ${type}`,
      propertyType: type,
      author : author,
      price: price.toString(),
      images: Rimages,
      description: faker.lorem.paragraph(),
      bedrooms: Nbedrooms.toString(),
      bathrooms: (Nbedrooms + faker.number.int({ min: -1, max: 2 })).toString(),
      halls: faker.number.int({ min: 1, max: 4 }).toString(),
      areaInSqft: (Math.round(faker.number.float({ min: 100.0, max: 1300.0 }) * 10.0) / 10.0).toString(),
      garages: faker.number.int({ min: 0, max: 3 }).toString(),
      builtupArea: (Math.round(faker.number.float({ min: 100.0, max: 1300.0 }) * 10.0) / 10.0).toString(),
      noOfFloors: nFloors,
      noOfRoads: faker.number.int({ min: 1, max: 4 }).toString(),
      location: `${faker.helpers.arrayElement(cities)}`,
      classification: classification,
      listingType: listingType,
      contact: '+97338820989', // Add contact field
      propertyUsage: usage,
      BFID: faker.string.uuid(),
    });

    await property.save();
  }
};

seedDB().then(() => {
  console.log("Seed data generated successfully!");
  mongoose.connection.close();
});
