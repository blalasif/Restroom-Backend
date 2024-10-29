import bcrypt from "bcryptjs";
import AuthModel from "../models/authModel.js";
import authValidation from "../validationSchemas/authValidation.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import TokenModel from "../models/tokenModel.js";
import InspectorOfficer from "../models/inspectorModel.js";
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

  // First, check if the user is a regular user
  let user = await AuthModel.findOne({ email });
  if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new ApiError(400, "Invalid email or password"));
    }

    // Generate access token
    const accessToken = generateAccessToken(user);

    // Check if a refresh token exists for the user in the database
    let refreshTokenData = await TokenModel.findOne({ userId: user._id });
    let refreshToken;

    if (refreshTokenData) {
      refreshToken = refreshTokenData.refreshToken;
    } else {
      // Generate and save a new refresh token if none exists
      refreshToken = generateRefreshToken(user);
      await TokenModel.create({ userId: user._id, refreshToken });
    }

    // Set both tokens as cookies
    setTokenCookies(res, accessToken, refreshToken);

    console.log("User logged in successfully");

    return res.status(200).json({
      success: true,
      message: "Login successful as regular user",
    });
  }

  // Next, check if the user is an inspector officer
  const inspector = await InspectorOfficer.findOne({ email });
  if (inspector) {
    const isPasswordValid = await bcrypt.compare(password, inspector.password);
    if (!isPasswordValid) {
      return next(new ApiError(400, "Invalid email or password"));
    }

    // Generate access token
    const accessToken = generateAccessToken(inspector);

    // Check if a refresh token exists for the inspector officer
    let refreshTokenData = await TokenModel.findOne({ userId: inspector._id });
    let refreshToken;

    if (refreshTokenData) {
      refreshToken = refreshTokenData.refreshToken;
    } else {
      // Generate and save a new refresh token if none exists
      refreshToken = generateRefreshToken(inspector);
      await TokenModel.create({ userId: inspector._id, refreshToken });
    }

    // Set both tokens as cookies
    setTokenCookies(res, accessToken, refreshToken);

    console.log("Inspector officer logged in successfully");

    return res.status(200).json({
      success: true,
      message: "Login successful as inspector officer",
    });
  }

  // If no user or inspector officer is found with that email
  return next(new ApiError(400, "Invalid email or password"));
});

export const editProfile = AsyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const { fullName, dob, nationality, gender, phoneNumber } = req.body;

  const updatedUser = await AuthModel.findById(userId);
  if (!updatedUser) return next(new ApiError(404, "User not found."));

  const getSingleValue = (value) => Array.isArray(value) ? value[0] : value;

  if (fullName) updatedUser.fullName = getSingleValue(fullName);
  if (dob) updatedUser.dob = new Date(getSingleValue(dob));
  if (nationality) updatedUser.nationality = getSingleValue(nationality);
  if (gender) updatedUser.gender = getSingleValue(gender);
  if (phoneNumber) updatedUser.phoneNumber = getSingleValue(phoneNumber);

  if (req.file) {
    try {
      if (updatedUser.profileImagePublicId) {
        console.log(
          "Deleting previous image ID:",
          updatedUser.profileImagePublicId
        );
        await deleteFromCloudinary(updatedUser.profileImagePublicId);
      }

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
});


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

  const userProfile = await AuthModel.findById(userId).select(
    "-__v -password"
  );

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
