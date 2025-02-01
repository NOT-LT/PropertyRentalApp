if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const path = require('path');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError')
const asyncHandler = require('./utils/asyncHandler')
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const maptilerClient = require('@maptiler/client');
const Property = require('./models/property');
const fs = require('fs/promises');
// const Typesense = require('typesense');
const helmet = require('helmet');
const dbUrl =  process.env.DB_URL || 'mongodb://localhost:27017/propertyRentalApp';
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const propertiesRoute = require('./routes/properties')
const inquiriesRoute = require('./routes/inquiry')
const usersRoute = require('./routes/users')
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
})

const LocationFeature = require('./models/locationFeature');

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'));
app.use(helmet({
  contentSecurityPolicy: false
}));
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: process.env.SESSION_SECRET
  }
});

store.on("error", function(e) {
  console.log("Session Store Error", e)
})
const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

// const typesenseClient = new Typesense.Client({
//   nodes: [
//     {
//       host: process.env.TYPESENSE_HOST,  // Typesense cloud host
//       port: process.env.TYPESENSE_PORT,  // Default is 443 for Typesense Cloud
//       protocol: process.env.TYPESENSE_PROTOCOL
//     }
//   ],
//   apiKey: process.env.TYPESENSE_API_KEY,  // Store API key securely in env variables
//   connectionTimeoutSeconds: 2
// });
app.use(expressSession(sessionConfig))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash())

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user; // passport stores user info in session and we have access to it in all templates
  if (!(res.locals.page)) {
    res.locals.page = { page: { title: '' } }
  }
  next();
})


app.get('/', asyncHandler(async (req, res) => {
  const properties = await Property.find({});
  res.render('landing', { properties, page: { title: 'landing' } })
}))
app.get('/properties.geojson', async (req, res) => {
  try {
    const features = await LocationFeature.find({});
    console.log(features);
    res.json({
      type: "FeatureCollection",
      features: features
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.use('/', usersRoute);
app.use('/properties/:id/inquiry', inquiriesRoute)
app.use('/properties', propertiesRoute)

// API endpoint to trigger MongoDB -> Typesense sync
app.post('/sync-data', async (req, res) => {
  try {
    const result = await syncMongoWithTypesense();
    res.status(200).send({ success: true, result });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q; // Get query from request parameters
    const propertyType = req.query.propertyTypeFilter.toString().toLowerCase() || 'all types';
    const location = req.query.locationFilter.toLowerCase() || 'all locations' ;
    // const price = req.query.averagePriceFilter.toLowerCase() || 'all prices';
    const listingType = req.query.listingTypeFilter.toLowerCase() || 'all';
    console.log('Search query:', query);
    if (query === '' || query === undefined || query === null || query.toLowerCase() == 'all') {
      const properties = await Property.find({  });
      const filteredProperties = properties.filter(property => {
        console.log(property);
        let match = true;
        if (propertyType && !(propertyType.includes(property.propertyType.toLowerCase())) && propertyType !== 'all types') {
          console.log('Property Type:', propertyType, property.propertyType);
          match = false;
        }
        if (location && !(location.includes(property.location.toLowerCase())) && location !== 'all locations') {
          match = false;
        }
        // if (price && price !== property.price && price !== 'all prices') {
        //   match = false;
        // }
        if (listingType && !(listingType.includes(property.listingType)) && listingType !== 'all') {
          match = false;
        }
        return match;
      });
      res.render('properties/searchResult', { properties:filteredProperties, searchQuery:query, page: { title: 'Search Results' } });
      return;
    }
    // const searchResults = await typesenseClient.collections('properties').documents().search({
    //   q: query,
    //   query_by: 'title,description,location,price,propertyType'
    // });
    // console.log("searchResult: ", searchResults)
    // const resultProperties = searchResults.hits.map(hit => hit.document);
    // const filteredProperties = resultProperties.filter(property => {
    //   console.log(property);
    //   let match = true;
    //   if (propertyType && propertyType !== property.propertyType && propertyType !== 'all types') {
    //     console.log('Property Type:', propertyType, property.propertyType);
    //     match = false;
    //   }
    //   if (location && location !== property.location && location !== 'all locations') {
    //     match = false;
    //   }
    //   // if (price && price !== property.price && price !== 'all prices') {
    //   //   match = false;
    //   // }
    //   if (listingType && listingType !== property.listingType && listingType !== 'all') {
    //     match = false;
    //   }
    //   return match;
    // });
    // const properties = [];
    // for (let i = 0; i < filteredProperties.length; i++) {
    //   const property = filteredProperties[i];
    //   const propertyDoc = await Property.findOne({ title: property.title, postDate: property.postDate });
    //   properties.push(propertyDoc);
    // }
    const properties = await Property.find({ $text: { $search: query } }).sort({ score: { $meta: 'textScore' } });
    console.log('Search results:', properties);
    res.render('properties/searchResult', { properties, searchQuery:query, page: { title: 'Search Results' } });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
});




app.use('*', (req, res, next) => {
  throw new ExpressError(404, 'Not Found')
})
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'error occured' } = err;
  const stack = err.stack;
  console.log(statusCode, message)
  res.status(statusCode).render('error', { statusCode, message, stack })
})

// async function createCollection() {
//   try {
//     const collectionSchema = {
//       name: 'properties', // Name of the collection
//       fields: [
//         { name: 'title', type: 'string' },
//         { name: 'description', type: 'string' },
//         { name: 'location', type: 'string', facet: true },
//         { name: 'price', type: 'string', facet: true },
//         { name: 'bedrooms', type: 'string', facet: true },
//         { name: 'bathrooms', type: 'string', facet: true },
//         { name: 'postDate', type: 'int64' },
//         {name: 'propertyType', type: 'string', facet: true},
//         {name: 'listingType', type: 'string', facet: true}
//       ]
//     };

//     const collection = await typesenseClient.collections().create(collectionSchema);
//     console.log('Collection created:', collection);
//   } catch (error) {
//     console.error('Error creating collection:', error);
//   }
// }

// Sync function to be triggered from the server
// async function syncMongoWithTypesense() {
//   try {
//     // Fetch documents from MongoDB
//     const properties = await Property.find({}).exec();

//     const transformedDocs = properties.map(property => {
//       const doc = property.toObject ? property.toObject() : property;

//       return {
//         title: doc.title, // Assuming title is a string and remains as such
//         description: doc.description, // Assuming description is a string and remains as such
//         location: doc.location, // Assuming location is a string and remains as such
//         price: doc.price, 
//         bedrooms: doc.bedrooms, 
//         bathrooms: doc.bathrooms, 
//         postDate: doc.postDate instanceof Date ? doc.postDate.getTime() : parseInt(doc.postDate, 10), // Convert Date to timestamp
//         propertyType: doc.propertyType,
//         listingType: doc.listingType 
//       };
//     });

//     // Convert MongoDB documents to JSONL format
//     const jsonlData = transformedDocs.map(property => JSON.stringify(property)).join('\n');

//     // Import data into Typesense
//     const result = await typesenseClient.collections(process.env.TYPESENSE_COLLECTION).documents().import(jsonlData,{ action: 'upsert' });

//     console.log('Import result:', result);
//   } catch (err) {
//     console.error('Error syncing MongoDB with Typesense:', err);
//   }
// }


// CALL IF YOU DELETED THE COLLECTION
// createCollection().then(() => {
//   console.log('Collection created');
//   syncMongoWithTypesense().then(() => {
//     console.log('Data synced');
//   });
// });





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
})
