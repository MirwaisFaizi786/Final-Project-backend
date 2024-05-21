const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeature');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const factory = require('./handlerFactory');
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}



exports.getAllTours = factory.getAll(Tour);
// catchAsync( async (req, res , next) => {
   
//         // // QUERY LOOK LIKE THIS { difficulty: 'easy', ratingsAverage: { lte: 4.5 }, duration: { gte: 5 } }
//         // const querySearch = {...req.query};

//         // excludeFields = ['page', 'sort', 'limit', 'fields'];
//         // // exclude page, sort, limit, fields
//         // excludeFields.forEach((el) => delete querySearch[el]);



//         // let queryString = JSON.stringify(querySearch);
//         // // Actual url: http://localhost:3000/api/v1/tours?difficulty=easy&duration[gte]=5
//         // // Actual query: { difficulty: 'easy', duration: { gte: 5 } }
//         // // And we add $ sign before gte, gt, lte, lt in query string to make it like this { difficulty: 'easy', duration: { $gte: 5 } }
//         // queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);


//         // const query =  Tour.find( querySearch );
//         // SORTING 
//         // if(req.query.sort) {
//         //     // tour?sort=price,ratingsAverage we change comma to space
//         //     const sortBy = req.query.sort.split(',').join(' ');
//         //     query.sort(sortBy);
//         // }else{
//         //     query.sort('-createdAt');
//         // }

//         // FIELD LIMITING tour?fields=name,duration,price
//         // if(req.query.fields) { 
//         //     const fields = req.query.fields.split(',').join(' ');
//         //     query.select(fields);
//         // }else{
//         //     // exclude __v from response
//         //     query.select('-__v');
//         // }
//         // // PAGINATION
//         // const page = req.query.page * 1 || 1;
//         // const limit = req.query.limit * 1 || 100;
//         // // page=2&limit=10, 1-10, 11-20 and so on
//         // const skip = (page - 1) * limit;

//         // query.skip(skip).limit(limit);

//         // if( req.query.page ) {
//         //     const numTours = await Tour.countDocuments();
//         //     if(skip >= numTours) throw new Error('This page does not exist');
//         // }

//         // EXECUTE QUERY
//         const features = new APIFeatures(Tour.find(), req.query)
//             .filter().sort().limitFields().paginate();
//         const tours = await features.query;
       
//         // SEND RESPONSE
//         res.status(200).json({
//             status: 'success',
//             results: tours.length,
//             data: {
//                 tours
//             }
//         });
  
// } )
exports.getTourStats = catchAsync( async (req, res, next) => {
    
        const stats = await Tour.aggregate(
            [
                {
                    $match: { ratingsAverage: { $gte: 4.5 } }
                },
                {
                    $group:{
                        _id: { $toUpper: '$difficulty' },
                        numTours:{ $sum: 1 },
                        numRatings: { $sum: '$ratingsQuantity' },
                        avgRating: { $avg: '$ratingsAverage' },
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' }

                    }
                },
                {
                    $sort: { avgPrice: 1 }
                },
                {
                    $match: { _id: { $ne: 'EASY' } }
                }
            ]
        )

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
   
} )


exports.getMonthlyPlan = catchAsync( async (req, res, next) => {
  
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates' //unwind startDates means we are going to create a new array for each startDates
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    
} )

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);








