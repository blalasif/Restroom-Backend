import { AsyncHandler } from "../utils/asyncHandler.js";
import Building from "../models/buildingModal.js";
import { ApiError } from "../utils/ApiError.js";
import InspectionReport from "../models/inspectionReportModel.js";
import { inspectionReportSchema } from "../validationSchemas/inspectionReportValidation.js";
import bcrypt from "bcryptjs";
import { inspectorValidation } from "../validationSchemas/inspectorValidation.js";
import AuthModel from "../models/authModel.js";
import InspectorOfficer from "../models/inspectorModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";
import TokenModel from "../models/tokenModel.js";
import { setTokenCookies } from "../utils/tokenUtils.js";

export const addInspectorOfficer = AsyncHandler(async (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  const { error } = inspectorValidation({
    fullName,
    email,
    password,
    role,
  });

  if (error) return next(new ApiError(401, error.details[0].message));
  if (!password) return next(new ApiError(400, "Password is required."));

  const existingInspector = await InspectorOfficer.findOne({ email });
  if (existingInspector)
    return next(new ApiError(400, "Inspector officer already exists."));

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!req.user?.id) {
    return next(
      new ApiError(
        400,
        "User must be logged in to create an inspector officer."
      )
    );
  }

  const newInspector = await InspectorOfficer.create({
    fullName,
    email,
    password: hashedPassword,
    role,
    OwnerId: req.user.id,
  });

  const accessToken = generateAccessToken(newInspector);
  const refreshToken = generateRefreshToken(newInspector);

  await TokenModel.create({
    userId: newInspector._id,
    refreshToken: refreshToken,
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "Inspector officer created successfully.",
    inspector: {
      fullName: newInspector.fullName,
      email: newInspector.email,
      role: newInspector.role,
      OwnerId: newInspector.OwnerId,
    },
  });
});

export const getBuildingsByOwner = AsyncHandler(async (req, res, next) => {
  const inspectorId = req.user?.id;

  const inspector =
    (await AuthModel.findById(inspectorId)) ||
    (await InspectorOfficer.findById(inspectorId));

  if (!inspector || inspector.role !== "inspector") {
    return next(
      new ApiError(403, "Access denied. Inspector role is required.")
    );
  }

  const ownerId = inspector.OwnerId;
  if (!ownerId) {
    console.log("Inspector details:", inspector);
    return next(new ApiError(400, "Inspector is not linked to an owner."));
  }

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
  const { issues } = req.body;

  const { error } = inspectionReportSchema.validate(req.body);
  if (error) {
    return next(new ApiError(400, error.details[0].message));
  }

  const inspectorId = req.user?.id;

  if (!Array.isArray(issues)) {
    return next(new ApiError(400, "Issues must be an array."));
  }

  const inspectionReport = await InspectionReport.create({
    inspectorId: inspectorId,
    issues: issues.map(({ restroomId, title, rating }) => ({
      restroomId,
      title,
      rating,
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

  const inspector = await InspectorOfficer.findById(inspectorId).select("role");
  if (!inspector || inspector.role !== "inspector") {
    return next(
      new ApiError(403, "Access denied or Inspector role is required")
    );
  }
  const reports = await InspectionReport.find({ inspectorId }).lean();

  const responseReports = reports.map((report) => ({
    _id: report._id, 
    inspectorId: report.inspectorId,
    issues: report.issues,
  }));

  res.status(200).json({
    count: responseReports.length, 
    success: true,
    message: "All Reports retrieved successfully.",
    reports: responseReports,
  });
});

export const getSingleReport = AsyncHandler(async (req, res, next) => {
  const { reportId } = req.params;
  const inspectorId = req.user?.id;

  const inspector = await InspectorOfficer.findById(inspectorId);
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
