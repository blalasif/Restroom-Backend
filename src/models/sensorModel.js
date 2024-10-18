import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    sensorName: { type: String, required: true },
    type: { type: String, required: true },
    ip: { type: String, required: true },
    port: { type: Number, required: true },
    url: { type: String, required: true },
    location: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    isConnected: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sensors", sensorSchema);
