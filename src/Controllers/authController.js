import bcrypt from "bcryptjs";
import AuthModel from "../models/authModel.js";
import authValidation from "../validationSchemas/authValidation.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import TokenModel from "../models/tokenModel.js";
import InspectorOfficer from "../models/inspectorModel.js";
import moment from "moment";
import multer from "multer";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
} from "../utils/tokenUtils.js";

export const signup = AsyncHandler(async (req, res, next) => {
  const { error } = authValidation(req.body);
  if (error) return next(new ApiError(400, error.details[0].message));

  const {
    fullName,
    email,
    password,
    role,
    phoneNumber,
    dob,
    gender,
    nationality,
  } = req.body;

  const existingUser = await AuthModel.findOne({ email });
  if (existingUser) return next(new ApiError(400, "User already exists"));

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await AuthModel.create({
    fullName,
    email,
    password: hashedPassword,
    role,
    phoneNumber,
    dob,
    gender,
    nationality,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "Registered Successfully",
  });
});

export const login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  let user = await AuthModel.findOne({ email });
  if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new ApiError(400, "Invalid email or password"));
    }

    const accessToken = generateAccessToken(user);

    let refreshTokenData = await TokenModel.findOne({ userId: user._id });
    let refreshToken;

    if (refreshTokenData) {
      refreshToken = refreshTokenData.refreshToken;
    } else {
      refreshToken = generateRefreshToken(user);
      await TokenModel.create({ userId: user._id, refreshToken });
    }

    setTokenCookies(res, accessToken, refreshToken);

    console.log("User logged in successfully");

    return res.status(200).json({
      success: true,
      message: "Login successful as regular user",
    });
  }

  const inspector = await InspectorOfficer.findOne({ email });
  if (inspector) {
    const isPasswordValid = await bcrypt.compare(password, inspector.password);
    if (!isPasswordValid) {
      return next(new ApiError(400, "Invalid email or password"));
    }

    const accessToken = generateAccessToken(inspector);

    let refreshTokenData = await TokenModel.findOne({ userId: inspector._id });
    let refreshToken;

    if (refreshTokenData) {
      refreshToken = refreshTokenData.refreshToken;
    } else {
      refreshToken = generateRefreshToken(inspector);
      await TokenModel.create({ userId: inspector._id, refreshToken });
    }

    setTokenCookies(res, accessToken, refreshToken);

    console.log("Inspector officer logged in successfully");

    return res.status(200).json({
      success: true,
      message: "Login successful as inspector officer",
    });
  }

  return next(new ApiError(400, "Invalid email or password"));
});


const storage = multer.memoryStorage(); // Use memory storage for uploading to Cloudinary
const upload = multer({ storage: storage });

// Edit Profile endpoint
export const editProfile = [
  upload.single("profileImage"), // Middleware for handling file upload
  AsyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    console.log("files", req.file);

    const { fullName, dob, nationality, gender, phoneNumber } = req.body;

    const updatedUser = await AuthModel.findById(userId);
    if (!updatedUser) return next(new ApiError(404, "User not found."));

    const getSingleValue = (value) => (Array.isArray(value) ? value[0] : value);

    if (fullName) updatedUser.fullName = getSingleValue(fullName);

    if (dob) {
      const dobValue = getSingleValue(dob);
      const parsedDob = moment(dobValue, "YYYY-MM-DD", true);
      if (parsedDob.isValid()) {
        updatedUser.dob = parsedDob.toDate();
      } else {
        return next(
          new ApiError(
            400,
            "Invalid date format for DOB. Please use YYYY-MM-DD."
          )
        );
      }
    }

    if (nationality) updatedUser.nationality = getSingleValue(nationality);
    if (gender) updatedUser.gender = getSingleValue(gender);
    if (phoneNumber) updatedUser.phoneNumber = getSingleValue(phoneNumber);

    if (req.file) {
      try {
        // Handle previous profile image deletion if necessary
        if (updatedUser.profileImagePublicId) {
          await deleteFromCloudinary(updatedUser.profileImagePublicId);
        }

        // Upload new profile image to Cloudinary
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "profileImage"
        );
        if (uploadResult && uploadResult.secure_url && uploadResult.public_id) {
          updatedUser.profileImage = uploadResult.secure_url;
          updatedUser.profileImagePublicId = uploadResult.public_id;
        } else {
          throw new Error("Upload to Cloudinary failed.");
        }
      } catch (error) {
        return next(
          new ApiError(500, "Image upload or deletion failed: " + error.message)
        );
      }
    }

    await updatedUser.save();

    // Fetch the updated user without sensitive information
    const fetchedUser = await AuthModel.findById(userId).select(
      "-__v -password -email"
    );
    if (!fetchedUser)
      return next(new ApiError(404, "User not found after update."));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...fetchedUser.toObject(),
        profileImage: fetchedUser.profileImage,
        profileImagePublicId: fetchedUser.profileImagePublicId,
      },
    });
  }),
];

export const changePassword = AsyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(
      new ApiError(
        400,
        "Old password, new password, and confirm password are required."
      )
    );
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ApiError(400, "New password and confirm password do not match.")
    );
  }

  const user = await AuthModel.findById(userId);
  if (!user) return next(new ApiError(404, "User not found."));

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return next(new ApiError(400, "Incorrect old password."));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

export const getProfile = AsyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const userProfile = await AuthModel.findById(userId).select("-__v -password");

  if (!userProfile) {
    return next(new ApiError(404, "User not found."));
  }

  res.status(200).json({
    success: true,
    user: userProfile,
  });
});

export const logout = AsyncHandler(async (req, res, next) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});
