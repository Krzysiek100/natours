// 1) Modules
const path = require('path');
const rateLimit = require('express-rate-limit');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

///USE PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARES

//SERVING STATIC FILE
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '40kb' }));
app.use(cookieParser()); // parser which allows to read token from cookie
//1)     Set security http
//HELMET HTTP
app.use(helmet());

//2)        Development loging
console.log(`Hello ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //3th part middleware, make logs to consol on every request (GET /api/v1/tours 200 3.241 ms - 8990)
}

//3)       LIMITER FROM RATELIMIT
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //100request on one hour
  message: 'Too many request from this ip. Try in an hour',
});
app.use('/api', limiter); // we wana set limiter on rout whoich starts with api

//Static file - middleware
//Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

//Data sanitization against NSQL query injection
app.use(mongoSanitize()); //check into req.body and deleting all $ itp

//Data sanitization against XSS
app.use(xss()); // delete input from html code

//Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
      'ratingsAverage',
    ],
  })
);

//My Middleware :)
app.use((req, res, next) => {
  next();
});

//what is better to rout URL
//mounting routes

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

///its middleware function, it is executet only when the url is not correct, because this tim ethe respond is not send
app.all('*', (req, res, next) => {
  // const err = new Error(
  //   `Can 't reach this url: ${req.originalUrl} on this server`
  // );
  // err.statusCode = 404;
  // err.status = 'fail';
  next(
    new AppError(
      `Can 't reach this url: ${req.originalUrl} on this servers`,
      404
    )
  );
});

//Middleware handling errors
app.use(globalErrorHandler);

module.exports = app;
