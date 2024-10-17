import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req?.cookies?.refreshToken;

  if (!accessToken) {
    return next(new ApiError(401, "Access Token Required"));
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError" && refreshToken) {
      const payload = jwt.decode(refreshToken);
      if (!payload) {
        return next(new ApiError(403, "Please Login again"));
      }

      const newAccessToken = generateAccessToken(payload);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      req.user = payload;
      return next();
    }

    return next(new ApiError(403, "Invalid Access Token"));
  }
};

export default authMiddleware;
