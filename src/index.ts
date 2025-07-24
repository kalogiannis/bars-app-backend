
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";

import myBarRoute from "./routes/MyBarRoute";
import barRoute from './routes/BarRoute'
import reservationRoute from './routes/ReservationRoute';
import myReservationRoute from './routes/MyReservationRoute';

import drinkMenuRoute from './routes/drinkMenu';
import favoriteRoute from "./routes/favorites";
import AdminUserRoute from "./routes/AdminUserRoute";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string) 
  .then(() => console.log("Connected to database!"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });   
});
app.use("/api/my/user", myUserRoute);
app.use("/api/my/bar", myBarRoute);
app.use("/api/bar", barRoute);
app.use(
  '/api/bar/:barId/reservations',
  reservationRoute
);
app.use("/api/my/reservations", myReservationRoute);

app.use("/api/drink-menu", drinkMenuRoute);
app.use("/api/favorites", favoriteRoute);
app.use("/api/admin/users", AdminUserRoute);

app.listen(7000, () => {
    console.log("server started on localhost:7000");
});



