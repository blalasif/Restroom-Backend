import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addInspectorOfficer, createInspectionReports, getAllReports, getBuildingsByOwner, getSingleReport } from "../Controllers/inspectionReportController.js";
const app = express();

app.post('/create-inspector',authMiddleware,addInspectorOfficer)
app.get('/get-owner-buildings', authMiddleware, getBuildingsByOwner)
app.post('/create-inspection-report', authMiddleware, createInspectionReports)
app.get('/get-All-reports', authMiddleware, getAllReports)
app.get('/get-single-report/:reportId', authMiddleware, getSingleReport)

export default app