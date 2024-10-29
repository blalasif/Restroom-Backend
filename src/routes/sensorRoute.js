import express from "express";
import cors from "cors";
import {
  addSensor,
  deleteSensor,
  getAllSensors,
  getSingleSensor,
  updateSensor,
} from "../Controllers/sensorController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    preflightContinue: true,
  })
);

app.post("/create", authMiddleware, addSensor);

app
  .route("/single/:sensorId")
  .get(authMiddleware, getSingleSensor)
  .put(authMiddleware, updateSensor)
  .delete(authMiddleware, deleteSensor);

app.get("/all", authMiddleware, getAllSensors);

export default app;
