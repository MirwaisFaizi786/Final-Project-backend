const express = require("express");
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  addImage,
  uploadTourPhoto,
  uploadTourSignleImage,
  searchForTour,
} = require("../controller/tourController");
const { protect, restrictTo } = require("../controller/authController");
const reviewRoute = require("./reviewRoute");
const router = express.Router();

// POST /tours/234fad4/reviews
// We want after getting the tour id , then we pass tour id to review route then review route will get tour id and create review and reviewRout must use the merge params in review route
router.use("/:tourId/reviews", reviewRoute);
router.get("/searchForTour", searchForTour);

//Test ===========================================
router.post("/addImage", uploadTourPhoto, addImage);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tours-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router
  .route("/")
  .get(getAllTours)
  .post(
    protect,
    restrictTo("admin", "lead-guide"),
    uploadTourPhoto,
    createTour
  );

router
  .route("/:id")
  .get(getTour)
  .put(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
