const express = require('express');
const { getAllReviews, createReview, deleteReview, setTourUserIds, updateReview } = require('../controller/reviewController');
const { protect, restrictTo } = require('../controller/authController');


const router = express.Router({ mergeParams: true });

// This is middleware to protect all routes after this middleware.
router.use(protect)

router.route('/').get(getAllReviews)
    .post(restrictTo('user'), setTourUserIds, createReview);
router.route('/:id')
    .delete( restrictTo('user', 'admin'), deleteReview)
    .get(getAllReviews)
    .patch( restrictTo('user', 'admin'), updateReview);


module.exports = router