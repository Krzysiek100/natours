const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController'); // Its becoming object, we can destructed it in imported file
const authController = require('../controllers/authController'); // Its becoming object, we can destructed it in imported file

//
//router.param('id', userController.checkID);
router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.logIn);
router.route('/logout').get(authController.logout);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

//PRotect all routes
router.use(authController.protect);

router
  .route('/updateMe')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );

router.route('/deleteMe').delete(userController.deleteMe);

router.route('/me').get(userController.getMe, userController.getUser);

router.route('/updateMyPassword').patch(authController.updatePassword);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

//GET - get all tours
// app.get('/api/v1/tours', getAllTours);

// //GET- one tour by id
// app.get('/api/v1/tours/:id', getTour);

// //POST - create new tour
// app.post('/api/v1/tours', createTour);

// //PATCH - update the tour
// app.patch('/api/v1/tours/:id', updateTour);

// //DELETE - tour by id
// app.delete('/api/v1/tours/:id', deleteTour);
