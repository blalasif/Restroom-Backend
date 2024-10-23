// import { ApiError } from "../utils/ApiError.js";

// const errorMiddleware = (err, req, res, next) => {
//     if (err instanceof ApiError) {
//         return res.status(err.statusCode).json({
//             success: false,
//             message: err.message,
//             errors: err.errors || null,
//         });
//     }

//     return res.status(500).json({
//         success: false,
//         message: 'Internal Server Error',
//     });
// };

// export default errorMiddleware;

import { ApiError } from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  console.log("Error handler", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorMiddleware;
