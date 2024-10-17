import express from "express";
import connectDB from "./src/Database/db.js";
import authRoutes from './src/routes/authRoute.js'
import sensorRoutes from './src/routes/sensorRoute.js'
import buildingRoute from './src/routes/buildingRoute.js'
import inspectionRoute from './src/routes/inspectionRoute.js'
import errorMiddleware from "./src/middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
const app = express();

const PORT = process.env.PORT || 5000;


connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());

//auth routes

app.use('/api/auth', authRoutes)

//sensor routes
app.use('/api/sensor', sensorRoutes)
//building route

app.use('/api/building', buildingRoute)
//inspection routes
app.use('/api/inspection',inspectionRoute)

app.get('/', (req, res) => {
    res.send("Hello Restroom Backend")
})

//error middleware
app.use(errorMiddleware)


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});