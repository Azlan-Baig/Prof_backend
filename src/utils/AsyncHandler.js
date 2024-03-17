// Async handler bananay k do tareeqy hain ek try or catch se or doosra promises se...


const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       //err.code matlab agar ye error user ki taraf se aya hai.
//       success: false,
//       message: err.message,
//     });
//   }
// };

export { asyncHandler };
