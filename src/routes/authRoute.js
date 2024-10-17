import express from "express";
import {
  changePassword,
  editProfile,
  login,
  signup,
} from "../Controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/multerConfig.js";

const app = express();

app.post("/signup", signup);
app.post("/login", login);
app.put(
  "/edit-profile",
  authMiddleware,
  upload.single("profileImage"),
  editProfile
);
app.put("/change-password", authMiddleware, changePassword);

export default app;
