// const fs = require('fs');
const { json } = require('express');
const { options } = require('../app');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/ApiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
/*const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);*/
// exports.checkId = (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);
//   if (val >= tours.length) {
//     return res.status(404).json({
//       status: 'failed',
//       messages: 'Invaild ID',
//     });
//   }
//   next();
// };
/*exports.checkBody = (req, res, next) => {
  //if (req.body.name == null || req.body.price == null) {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'failed',
      message: 'name or price not found',
    });
  }
  next();
};*/

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.GetAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // Execute the query
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.GetTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id); // find with document with id
  if (!tour) {
    return next(new AppError('No tour found with this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.UpdateData = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // to return the new modified document
    runValidators: true, //ensures that the update object is validated according to your schema rules.
  });
  if (!tour) {
    return next(new AppError('No tour found with this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.DeleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with this ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.CreateNewTour = catchAsync(async (req, res, next) => {
  const NewTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: NewTour,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } }, // match only the documents that meet the specified condition
    {
      $group: {
        // group the documents by the specified _id expression and apply the accumulator expressions to each group.
        _id: '$difficulty', // group by difficulty
        numTours: { $sum: 1 }, // add 1 for each document
        numRaiting: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // sort by avgPrice ascending
    },
    // { $match: { _id: { $ne: 'easy' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plane = await Tour.aggregate([
    {
      $unwind: '$startDates', //deconstruct an array field from the info documents and then output one document for each element of the array.
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plane,
    },
  });
});

// ✅ catchAsync executes at STARTUP (when files load)
// ✅ catchAsync creates wrapper functions
// ✅ Wrapper functions are stored in exports.*
// ✅ Routes register with wrapper functions
// ✅ When request comes, wrapper is called (NOT catchAsync)
// ✅ Wrapper calls the original async function
// ✅ If error, wrapper catches it and calls next(error)
