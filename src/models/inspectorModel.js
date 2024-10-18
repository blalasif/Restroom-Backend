import mongoose from "mongoose";

const inspectorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "inspector",
    },
    OwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  { timestamps: true }
);

const InspectorOfficer = mongoose.model("InspectorOfficer", inspectorSchema);
export default InspectorOfficer;
