import express from "express";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "https://anky-omega.vercel.app" /*"http://localhost:5174" */,
    credentials: true,
  })
);
app.use(express.json());
app.use(authRoutes);

export default app;
