const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

//////////////MONGOOSE SCHEMA AND MODEL
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must to have a name'],
      trim: true,
      minlength: [10, 'The tour name must have at least 10 characters'],
      maxlength: [40, 'The tour name must have the most 40 characters'], // validators
      // validate: {
      //   validator: validator.isAlpha,
      //   message: 'The name must contain only characters',
      // },
    },
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      defult: false,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        mesage:
          'The tour can have one of three difficulties: easy, medium, difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating mus be above 1.0'],
      max: [5, 'Rating mus be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //our own validator works only for new docujments, not for updating :)
        validator: function (val) {
          return this.price > val;
        },
        message: 'The price must be bigger than the discount',
      },
    },
    summary: {
      type: String,
      trim: true, // delete white space from beggining and end
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image Cover'], //we have to keep image name in DB, to not to keep whole image in db
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      //just object, not embeded document
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      //is needed to set it into array, because it is eneded document into tours
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    // guides: Array - I was when we wanna have embaded users here. So we needed function in middleware doc, to add users here
    guides: [
      {
        //child referencing
        type: mongoose.Schema.ObjectId, //we expect that here will be mongo ObjectID
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2d' });
//Virtual properties - they are not correct in DB, but the are just added to document, but not to DB
//function get is executed each time when we get data from db
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//////////////////////////////////////////////////////////////////////////////////MIDDLEWARE DOCUMENT
//it will bez executed before saving the document to DB, on save() or create()
tourSchema.pre('save', function (next) {
  console.log('The tour has been added');
  this.slug = slugify(this.name, { lower: true });
  next();
});

//////////////////////////////////////add guides to table in tours at saving documents
// tourSchema.pre('save', async function (next) {
//   //embeded documents. its why we can have use users in tours.
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   //function is gona executed after saving the docu ment to DB.
// });
//////////////////////////////////////////////////////////////////////////////////MIDDLEWARE QUERY
tourSchema.pre(/^find/, function (next) {
  // - is a object, query
  this.find({ secretTour: { $ne: true } }); // want to get tours which has secretTour set on false
  next();
});

///pre function query middleware, which will give us that query will populate guides fileds with the refrenced user
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

///VIRTUAL POPULATING - reviews in tours, but they do not exist in DB
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// tourSchema.post(/^find/, function (doc, next) {
//   //we have acces to the whole query - doc
// });

//////////////////////////////////////////////////////////////////////////////////MIDDLEWARE Aggregation
// tourSchema.pre('aggregate', function (next) {
//   // do not take to aggregate documents where secret tour is set on true
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

////////////////////////////////////////////////////////////////////////////////////////Model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });

// //Add row to collection
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Err: ', err);
//   });
