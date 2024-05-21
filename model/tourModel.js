const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String

    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
  }, 
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// pre-save middleware is called before saving any document
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

// indexing for faster queries
tourSchema.index({ price: 1 , ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

// // EMBEDDING MIDDLEWARE: runs before .save() and .create() 
// tourSchema.pre('save', async function(next) {
//   const guidesPromise = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// })


// QUERY MIDDLEWARE 
// pre-find middleware is called before .find()
// /^find/ is a regular expression that matches any string that starts with 'find'
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    next(); 
})

//POPULATE MIDDLEWARE: runs before .find() and .findOne() queries and queries guides embedded in tour document using ref: 'User'
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt' // we don't want passwordChangedAt and __v in guides
  });
  next();
})
// AGGREGATION MIDDLEWARE
// pre-aggregate middleware is called before .aggregate()
// actually we removing secret tour from query pipeline if it's true   
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
})

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7
})
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;