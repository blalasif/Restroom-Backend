import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "inspector"],
      default: "user",
    },
    phoneNumber: { type: String, default: null },
    dob: { type: Date, default: null },
    gender: { type: String, default: null },
    nationality: { type: String, default: null },
    profileImage: { type: String, default: null },
    profileImagePublicId: { type: String, default: null },
    OwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
  },
  { timestamps: true }
);

const AuthModel = mongoose.model("Auth", authSchema);
export default AuthModel;
