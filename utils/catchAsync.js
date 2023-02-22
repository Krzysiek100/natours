//It takes as argument async function, which returns promise and is rejected when is some error, so wy we can catch a error here
//when response is ok, so response is sending
//catchAsync must returns a function which is assigned to function exported, and they will be called by express
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next); //the same as catch(err => next())
};
