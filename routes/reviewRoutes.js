const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('../controllers/authController'); // Its becoming object, we can destructed it in imported file

const router = express.Router({ mergeParams: true }); // by this we have acces to parameteres from url, which was in other rout

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setUserTourId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
