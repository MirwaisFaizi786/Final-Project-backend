const mongoose = require('mongoose');
const Tour = require('./tourModel');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    // .populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    next();
})

// STATIC METHODS : These are methods that can be used on the model.
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(" asdfasdf;lajs;ldjf;laksjdl;kfj");
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
    console.log("stats:::::: ",stats);
}

// INDEX MIDDLEWARE: in here we create an index on tour and user to make sure we can only have one review per user per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

//
reviewSchema.post('save', function() {
    // this points to current review
    console.log("save review mmmmmmmmmmm");
    this.constructor.calcAverageRatings(this.tour);

});
// QUERY MIDDLEWARE : runs before .findOneUpdate() and .findOneAndDelete() queries
// in here first find the review that we want to update or delete to store it in the r variable
// because need to use this.r in the post middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});

// post middleware: runs after .findOneUpdate() and .findOneAndDelete() queries
// in here we call the calcAverageRatings function to update the tour rating
reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema)





module.exports = Review