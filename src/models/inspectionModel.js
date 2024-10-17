import { Schema, mongoose } from "mongoose";

const InspectionReportSchema = new Schema({
    inspectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true,
    },
    reports: [
        {
            restroomId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Restroom',
                required: true,
            },
            entries: [
                {
                    reportTitle: {
                        type: String,
                        required: true,
                        trim: true,
                    },
                    rating: {
                        type: Number,
                        required: true,
                        min: 1,
                        max: 5,
                    },
                }
            ]
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const InspectionReport = mongoose.model("InspectionReport", InspectionReportSchema);
export default InspectionReport;
