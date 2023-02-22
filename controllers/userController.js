const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

////MULTER
// const multerStorage = multer.diskStorage({
//   //better is dave img into memory than into disk
//   // cb is like next()
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage(); //img will be stored in the buffer

const multerFilter = (req, file, cb) => {
  // checking if whis is a image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload image only'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); //we are making squares

  next();
};

exports.checkID = (req, res, next, value) => {
  console.log('Hello from checkID');

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

///////////////////////////////////////////It is here because it has nothing common with authenthication. Its onlyh users
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user want to change password
  // console.log(req.file);
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for change password. Please use /updateMyPassword',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'succes',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //1) Create error if user want to change password
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  if (!user) {
    return next(new AppError('This user doesnt exist', 400));
  }

  res.status(204).json({
    status: 'succes',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
//GET - get all users
exports.getAllUsers = factory.getAll(User);

//GET- one user by id
exports.getUser = factory.getOne(User);

//POST - create new user
exports.createUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    time: req.requestTime,
    data: 'Wait for it',
  });
};

//PATCH - update the user
exports.updateUser = factory.updateOne(User);

//DELETE - tour by id
exports.deleteUser = factory.deleteOne(User);
