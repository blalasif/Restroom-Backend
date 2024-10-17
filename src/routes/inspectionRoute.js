import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createInspectionReports, getAllReports, getBuildingsByOwner, getSingleReport } from "../Controllers/inspectionController.js";
const app = express();

app.get('/get-owner-buildings', authMiddleware, getBuildingsByOwner)
app.post('/create-inspection-report', authMiddleware, createInspectionReports)
app.get('/get-All-reports', authMiddleware, getAllReports)
app.get('/get-single-report/:reportId', authMiddleware, getSingleReport)

export default app