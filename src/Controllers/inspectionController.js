import { AsyncHandler } from "../utils/asyncHandler.js";
import Building from "../models/buildingModal.js";
import { ApiError } from "../utils/ApiError.js";
import AuthModel from "../models/authModel.js";
import InspectionReport from "../models/inspectionModel.js";
import { inspectionReportSchema } from "../validationSchemas/inspectionReportValidation.js";

export const getBuildingsByOwner = AsyncHandler(async (req, res, next) => {
  const inspectorId = req.user?.id;

  const inspector = await AuthModel.findById(inspectorId);

  if (!inspector || inspector.role !== "inspector") {
    return next(
      new ApiError(403, "Access denied. Inspection role is required")
    );
  }

  const ownerId = inspector.OwnerId;
  const buildings = await Building.find({ buildingOwner: ownerId }).populate(
    "buildingOwner",
    "fullName email"
  );

  if (!buildings.length) {
    return next(new ApiError(404, "No buildings found for this owner."));
  }

  return res.status(200).json({
    success: true,
    count: buildings.length,
    buildings,
  });
});

export const createInspectionReports = AsyncHandler(async (req, res, next) => {
  const { reports } = req.body;

  const { error } = inspectionReportSchema.validate(req.body);
  if (error) {
    return next(new ApiError(400, error.details[0].message));
  }

  const inspectorId = req.user?.id;

  const inspectionReport = await InspectionReport.create({
    inspectorId: inspectorId,
    reports: reports.map(({ restroomId, entries }) => ({
      restroomId: restroomId,
      entries: entries.map(({ rating, reportTitle }) => ({
        rating,
        reportTitle,
      })),
    })),
  });

  return res.status(201).json({
    success: true,
    message: "Inspection reports created successfully.",
    report: inspectionReport,
  });
});

export const getAllReports = AsyncHandler(async (req, res, next) => {
  const inspectorId = req.user?.id;
  const inspector = await AuthModel.findById(inspectorId);

  if (!inspector || inspector.role != "inspector") {
    return next(
      new ApiError(403, "Access denied or Inspector role is required")
    );
  }
  const reports = await InspectionReport.find({ inspectorId });

  res.status(200).json({
    success: true,
    message: "All Reports",
    reports,
  });
});

export const getSingleReport = AsyncHandler(async (req, res, next) => {
  const { reportId } = req.params;
  const inspectorId = req.user?.id;

  const inspector = await AuthModel.findById(inspectorId);
  if (!inspector || inspector.role != "inspector") {
    return next(
      new ApiError(403, "Access denied or Inspector role is required")
    );
  }

  const singleReport = await InspectionReport.findOne({
    _id: reportId,
    inspectorId,
  });

  if (!singleReport) {
    return next(new ApiError(404, "No report found with this ID."));
  }

  res.status(200).json({
    success: true,
    message: "Report found.",
    singleReport,
  });
});
