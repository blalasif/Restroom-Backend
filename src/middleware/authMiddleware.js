import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken } from "../utils/tokenUtils.js";

const authMiddleware = async (req, res, next) => {
  const accessToken = req?.cookies?.accessToken;
  const refreshToken = req?.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return next(new ApiError(401, "Unauthorized, please log in again"));
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      if (!refreshToken) {
        return next(new ApiError(401, "Unauthorized, please log in again"));
      }

      try {
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const newAccessToken = generateAccessToken({
          _id: decodedRefreshToken.id,
          role: decodedRefreshToken.role,
          email: decodedRefreshToken.email,
        });

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        req.user = decodedRefreshToken;
        return next();
      } catch (err) {
        return next(
          new ApiError(
            403,
            "Both access and refresh tokens expired, please log in again"
          )
        );
      }
    }

    return next(new ApiError(403, "Invalid access token"));
  }
};

export default authMiddleware;
