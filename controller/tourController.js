const multer = require("multer");
const fs = require("fs");
const Tour = require("../model/tourModel");
const APIFeatures = require("../utils/apiFeature");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const factory = require("./handlerFactory");

// Multipal files upload==============================================
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/tours");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `tour-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadTourPhoto = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
// end of multiple files upload=======================================

// function getImageDataAsBase64(imagePath) {
//   return new Promise((resolve, reject) => {
//     fs.access(imagePath, fs.constants.F_OK, (err) => {
//       if (err) {
//         if (err.code === "ENOENT") {
//           resolve(""); // Return empty string if file does not exist
//         } else {
//           reject(err); // Handle other errors
//         }
//       } else {
//         fs.readFile(imagePath, (err, data) => {
//           if (err) {
//             reject(err);
//           } else {
//             if (data.length === 0) {
//               resolve(""); // Return empty string if file is empty
//             } else {
//               resolve(Buffer.from(data).toString("base64"));
//             }
//           }
//         });
//       }
//     });
//   });
// }

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // To allow for nested GET reviews on tour (hack)
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const features = new APIFeatures(Tour.find(filter), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const doc = await features.query;
//   // const doc = await features.query.explain(); // For debugging to check query performance

//   console.log(doc.length);
//   const processTours = async (docs) => {
//     const tours = await Promise.all(
//       docs.map(async (tour) => {
//         const imageCover = await getImageDataAsBase64(
//           `./public/img/tours/${tour.imageCover}`
//         ).catch(() => tour.imageCover);
//         // const images = await Promise.all(tour.images.map(async (image) => {
//         //     return await getImageDataAsBase64(`./public/img/tours/${image}`).catch(() => image);
//         // }));

//         return {
//           _id: tour._id,
//           name: tour.name,
//           price: tour.price,
//           imageCover,
//           // images,
//           difficulty: tour.difficulty,
//           duration: tour.duration,
//           summary: tour.summary,
//           maxGroupSize: tour.maxGroupSize,
//           rating: tour.ratingsAverage,
//           ratingsQuantity: tour.ratingsQuantity,
//           startLocation: tour.startLocation,
//           locations: tour.locations,
//           guides: tour.guides,
//           startDates: tour.startDates,
//           reviews: tour.reviews,
//           createdAt: tour.createdAt,
//         };
//       })
//     );
//     return tours;
//   };

//   res.status(200).json({
//     status: "success get all Tours",
//     results: doc.length,
//     data: {
//       data: await processTours(doc),
//     },
//   });
// });

//catchAsync(async (req, res, next) => {
// // QUERY LOOK LIKE THIS { difficulty: 'easy', ratingsAverage: { lte: 4.5 }, duration: { gte: 5 } }
// const querySearch = {...req.query};

// excludeFields = ['page', 'sort', 'limit', 'fields'];
// // exclude page, sort, limit, fields
// excludeFields.forEach((el) => delete querySearch[el]);

// let queryString = JSON.stringify(querySearch);
// // Actual url: http://localhost:3000/api/v1/tours?difficulty=easy&duration[gte]=5
// // Actual query: { difficulty: 'easy', duration: { gte: 5 } }
// // And we add $ sign before gte, gt, lte, lt in query string to make it like this { difficulty: 'easy', duration: { $gte: 5 } }
// queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

// const query =  Tour.find( querySearch );
// SORTING
// if(req.query.sort) {
//     // tour?sort=price,ratingsAverage we change comma to space
//     const sortBy = req.query.sort.split(',').join(' ');
//     query.sort(sortBy);
// }else{
//     query.sort('-createdAt');
// }

// FIELD LIMITING tour?fields=name,duration,price
// if(req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query.select(fields);
// }else{
//     // exclude __v from response
//     query.select('-__v');
// }
// // PAGINATION
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// // page=2&limit=10, 1-10, 11-20 and so on
// const skip = (page - 1) * limit;

// query.skip(skip).limit(limit);

// if( req.query.page ) {
//     const numTours = await Tour.countDocuments();
//     if(skip >= numTours) throw new Error('This page does not exist');
// }

// EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: "EASY" } },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates", //unwind startDates means we are going to create a new array for each startDates
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

exports.getTour = factory.getOne(Tour, { path: "reviews" });

// exports.getTour = catchAsync(async (req, res, next) => {
//   let tour = await Tour.findById(req.params.id).populate("reviews");
//   if (!tour) {
//     return next(new AppError("No document found with that ID Exact ", 404));
//   }
//   const processTour = async (docs) => {
//     const imageCover = await getImageDataAsBase64(
//       `./public/img/tours/${tour.imageCover}`
//     ).catch(() => tour.imageCover);
//     const images = await Promise.all(
//       tour.images.map(async (image) => {
//         return await getImageDataAsBase64(`./public/img/tours/${image}`).catch(
//           () => image
//         );
//       })
//     );

//     return {
//       _id: tour._id,
//       name: tour.name,
//       price: tour.price,
//       description: tour.description,
//       imageCover,
//       images,
//       difficulty: tour.difficulty,
//       duration: tour.duration,
//       summary: tour.summary,
//       maxGroupSize: tour.maxGroupSize,
//       rating: tour.ratingsAverage,
//       ratingsQuantity: tour.ratingsQuantity,
//       startLocation: tour.startLocation,
//       locations: tour.locations,
//       guides: tour.guides,
//       startDates: tour.startDates,
//       reviews: tour.reviews,
//       createdAt: tour.createdAt,
//     };
//   };

//   res.status(200).json({
//     status: "success",
//     data: {
//       data: await processTour(tour),
//     },
//   });
// });

// exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.createTour = catchAsync(async (req, res, next) => {
  console.log("req.body ================= ", req.body);
  console.log("req.files ================= ", req.body.startLocation);

  const doc = await Tour.create({
    name: req.body.name,
    duration: req.body.duration,
    maxGroupSize: req.body.maxGroupSize,
    difficulty: req.body.difficulty,
    ratingsAverage: req.body.ratingsAverage,
    ratingsQuantity: req.body.ratingsQuantity,
    price: req.body.price,
    priceDiscount: req.body.priceDiscount,
    summary: req.body.summary,
    description: req.body.description,
    startLocation: req.body.startLocation, //req.body.startLocation,
    locations: JSON.parse(req.body.locations), //req.body.locations,
    startDates: req.body.startDates.split(",").map((d) => new Date(d)),
    images: req.files.images.map((a) => a.filename),
    imageCover: req.files.imageCover[0].filename,
  });
  res.status(201).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.addImage = catchAsync(async (req, res, next) => {
  const file = req.files;
  console.log("file name ================= ", req.files.imageCover[0].filename);
  if (!file) {
    return next(new AppError("Please upload a file", 400));
  }
  res.status(200).json({
    status: "success",
    data: file,
  });
});

const buildQuery = (queryParams) => {
  const query = {};

  if (queryParams.name) {
    query.name = { $regex: queryParams.name, $options: "i" }; // Case-insensitive regex search
  }
  if (queryParams.difficulty) {
    query.difficulty = queryParams.difficulty;
  }
  if (queryParams.minPrice && queryParams.maxPrice) {
    query.price = { $gte: queryParams.minPrice, $lte: queryParams.maxPrice };
  } else if (queryParams.minPrice) {
    query.price = { $gte: queryParams.minPrice };
  } else if (queryParams.maxPrice) {
    query.price = { $lte: queryParams.maxPrice };
  }
  if (queryParams.startLocation) {
    query["startLocation.address"] = {
      $regex: queryParams.startLocation,
      $options: "i",
    };
  }
  if (queryParams.ratingsAverage) {
    query.ratingsAverage = { $gte: queryParams.ratingsAverage };
  }

  return query;
};

exports.searchForTour = catchAsync(async (req, res, next) => {
  const queryObject = buildQuery(req.query);
  const tours = await Tour.find(queryObject);
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});
