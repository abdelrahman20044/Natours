const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalError = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
//set security HTTP headers
app.use(helmet());

//1) middlewares
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limiting requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //  we can limit the amount of data coming from the body to 10kb

// Data sanitization basically means to clean all the data that comes into the application from malicious code
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS , This will then clean any user input from malicious HTML code
app.use(xss()); // we prevent that by converting html symbols

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      // allow duplicate values in query string for these fields
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // new date = right now   ,  toISOString = convert it to a readable string
  next();
});

//2) route handlers

//3) routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalError);
//4)start server
module.exports = app;
