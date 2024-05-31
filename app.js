const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const app = express();
const rateLimit = require("express-rate-limit");
const globalErrorHandler = require("./controller/errorController");
const tourRoute = require("./route/tourRoute");
const userRoute = require("./route/userRoute");
const reviewRoute = require("./route/reviewRoute");
const AppError = require("./utils/appError");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",

    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors()); // Enable pre-flight requests for all routes

app.use(express.static(`${__dirname}/public`));

// 1) this body parser, will limiting requests body size to 10kb
app.use(express.json({ limit: "10mb" }));
// cookie parser
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});
// 2) helmet will set security HTTP headers
app.use(helmet());

// xss will sanitize against cross site scripting
app.use(xss());

// 3) Data sanitization against NoSQL query injection
app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
//1) Global middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  next();
});
//1) Limit requests from same API || 100 requests from same IP in an hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
  // skip: (req, res) => {
  //     return req.ip === '127.0.0.1'
  // },
});

app.use("/api", limiter);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tours", tourRoute);
app.use("/api/v1/reviews", reviewRoute);

// app.all() means all the routes that are not defined in tourRoute
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on this server`
  // })

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
