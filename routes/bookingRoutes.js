const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('../controllers/authController'); // Its becoming object, we can destructed it in imported file

const router = express.Router(); // by this we have acces to parameteres from url, which was in other rout

router
  .route('/checkout-session/:tourId')
  .get(authController.protect, bookingController.getCheckoutSession);

module.exports = router;
