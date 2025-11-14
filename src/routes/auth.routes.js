import { Router } from "express";
import { getData, updateData } from "../controllers/auth.controllers.js";

const router = Router();

router.get("/data", getData); //
router.post("/updateData", updateData);

export default router;
