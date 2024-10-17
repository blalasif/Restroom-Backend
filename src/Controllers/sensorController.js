import sensorModel from "../models/sensorModel.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import sensorValidation from "../validationSchemas/sensorValidation.js";

export const addSensor = AsyncHandler(async (req, res, next) => {
  const { error } = sensorValidation.validate(req.body);
  if (error) return next(new ApiError(400, error.details[0].message));

  const {
    sensorName,
    type,
    ip,
    port,
    url,
    location,
    uniqueId,
    isConnected,
    status,
  } = req.body;

  const existingSensor = await sensorModel.findOne({ uniqueId });
  if (existingSensor)
    return next(new ApiError(400, "Sensor with this uniqueId already exists."));

  const createSensor = await sensorModel.create({
    sensorName,
    type,
    ip,
    port,
    url,
    location,
    uniqueId,
    isConnected,
    status,
    userId: req.user.id,
  });

  return res.status(201).json({
    message: "Sensor Created Successfully",
    success: true,
    createSensor,
  });
});

export const getAllSensors = AsyncHandler(async (req, res, next) => {
  const sensors = await sensorModel.find({ userId: req.user.id });

  if (!sensors || sensors.length === 0)
    return next(new ApiError(404, "No sensors found for this user"));

  res.status(200).json({
    success: true,
    message: "All Sensors",
    sensors,
  });
});

export const deleteSensor = AsyncHandler(async (req, res, next) => {
  const { sensorId } = req.params;

  const deletedSensor = await sensorModel.findOneAndDelete({
    _id: sensorId,
    userId: req.user.id,
  });

  if (!deletedSensor)
    return next(
      new ApiError(
        404,
        "Sensor not found or you do not have permission to delete it."
      )
    );

  res.status(200).json({
    success: true,
    message: "Sensor deleted successfully",
  });
});

export const getSingleSensor = AsyncHandler(async (req, res, next) => {
  const { sensorId } = req.params;

  const sensor = await sensorModel.findOne({
    _id: sensorId,
    userId: req.user.id,
  });

  if (!sensor) return next(new ApiError(404, "Sensor not found"));

  res.status(200).json({
    success: true,
    Message: "Sensor Found",
    sensor,
  });
});

export const updateSensor = AsyncHandler(async (req, res, next) => {
  const { sensorId } = req.params;
  const { error } = sensorValidation.validate(req.body);

  if (error) return next(new ApiError(400, error.details[0].message));

  const existingSensor = await sensorModel.findOne({
    _id: sensorId,
    userId: req.user.id,
  });

  if (!existingSensor)
    return next(
      new ApiError(
        404,
        "Sensor not found or you do not have permission to update it."
      )
    );

  const { uniqueId } = req.body;
  const uniqueIdExists = await sensorModel.findOne({
    uniqueId,
    _id: { $ne: sensorId },
  });

  if (uniqueIdExists)
    return next(new ApiError(400, "Sensor with this uniqueId already exists."));

  const updatedSensor = await sensorModel.findOneAndUpdate(
    { _id: sensorId, userId: req.user.id },
    req.body,
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Sensor updated successfully",
    sensor: updatedSensor,
  });
});
