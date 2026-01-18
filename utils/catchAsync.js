module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// ✅ catchAsync executes at STARTUP (when files load)
// ✅ catchAsync creates wrapper functions
// ✅ Wrapper functions are stored in exports.*
// ✅ Routes register with wrapper functions
// ✅ When request comes, wrapper is called (NOT catchAsync)
// ✅ Wrapper calls the original async function
// ✅ If error, wrapper catches it and calls next(error)
