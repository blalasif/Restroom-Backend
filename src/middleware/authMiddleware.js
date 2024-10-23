// import jwt from "jsonwebtoken";
// import { ApiError } from "../utils/ApiError.js";

// const generateAccessToken = (user) => {
//   return jwt.sign(
//     { id: user._id, email: user.email, role: user.role },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: "15m" }
//   );
// };

// const authMiddleware = async (req, res, next) => {
//   const accessToken = req.cookies.accessToken;
//   const refreshToken = req?.cookies?.refreshToken;

//   if (!accessToken) {
//     return next(new ApiError(401, "Unauthorized"));
//   }

//   try {
//     const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;
//     return next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError" && refreshToken) {
//       const payload = jwt.decode(refreshToken);
//       if (!payload) {
//         return next(new ApiError(403, "Please Login again"));
//       }

//       const newAccessToken = generateAccessToken(payload);
//       res.cookie("accessToken", newAccessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 15 * 60 * 1000,
//       });

//       req.user = payload;
//       return next();
//     }

//     return next(new ApiError(403, "Invalid Access Token"));
//   }
// };

// export default authMiddleware;

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import TokenModel from "../models/tokenModel.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

const authMiddleware = async (req, res, next) => {
  const accessToken = req?.cookies?.accessToken;
  const refreshToken = req?.cookies?.refreshToken;

  console.log("accesss token", accessToken);

  if (!accessToken) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError" && refreshToken) {
      try {
        // Check the refresh token
        const refreshTokenData = await TokenModel.findOne({ refreshToken });
        if (!refreshTokenData) {
          return next(
            new ApiError(403, "Refresh token not found, please login again")
          );
        }

        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const newAccessToken = generateAccessToken({
          _id: decodedRefreshToken.id,
          email: decodedRefreshToken.email,
          role: decodedRefreshToken.role,
        });

        // Update the refresh token if needed (optional, depending on your logic)
        // await TokenModel.updateOne({ userId: decodedRefreshToken.id }, { refreshToken, expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000 });

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        req.user = decodedRefreshToken;
        return next();
      } catch (err) {
        return next(new ApiError(403, "Invalid Refresh Token"));
      }
    }

    return next(new ApiError(403, "Invalid Access Token"));
  }
};

export default authMiddleware;
