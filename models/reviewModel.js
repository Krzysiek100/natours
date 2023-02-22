const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating mus be above 1.0'],
      max: [5, 'Rating mus be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

///statinc method, because we need to aggregate on model(this=current model)
reviewSchema.statics.calcAvgRatings = async function (tourid) {
  // const tour = Tour.findByIdAndUpdate(tourid, {})

  const stats = await this.aggregate([
    {
      $match: {
        tour: tourid,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourid, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourid, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

///is needed to do this in this way, because we need to use this whenever the new query is saved(after = post).
//this.constructor is a current model
reviewSchema.post('save', function () {
  this.constructor.calcAvgRatings(this.tour); // points to model who created this model
});

///to update reviews when is updated and deleted is needed a new middleware (findOneAndUpdate/delete works in behind like findOne)
//so before deleting this review or updating we need to find this and later in next middleware use function post to update by calcAvg
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvgRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
