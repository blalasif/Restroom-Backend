import express from 'express';
import { addSensor, deleteSensor, getAllSensors, getSingleSensor, updateSensor }
    from '../Controllers/sensorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const app = express();


app.post("/create", authMiddleware, addSensor);

app.route("/single/:sensorId")
    .get(authMiddleware, getSingleSensor)
    .put(authMiddleware, updateSensor)
    .delete(authMiddleware, deleteSensor)

app.get("/all", authMiddleware, getAllSensors)


export default app;
