import express from "express";
import upload from "../config/multerConfig.js";
import {
  addBuilding,
  deleteBuilding,
  getAllBuildings,
  getSingleBuilding,
  updateBuilding,
} from "../Controllers/buildingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { configureApp, __dirname } from "../config/serverConfig.js";

const app = express();

configureApp(app);

app.post(
  "/create-building",
  authMiddleware,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "modalImage", maxCount: 1 },
    { name: "restroomImages", maxCount: 10 },
  ]),
  addBuilding
);

app.put(
  "/update-building/:buildingId",
  authMiddleware,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "modalImage", maxCount: 1 },
    { name: "restroomImages", maxCount: 10 },
  ]),
  updateBuilding
);

app.get("/all-buildings", authMiddleware, getAllBuildings);
app.delete("/delete-building/:buildingId", authMiddleware, deleteBuilding);
app.get("/single-building/:buildingId", authMiddleware, getSingleBuilding);

export default app;
