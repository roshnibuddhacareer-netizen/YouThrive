import express from "express";
import {
  markComplete,
  unmarkComplete,
  getTodayLogs,
  getRangeLogs,
  getHeatmap,
  getStats,
  getHabitStats,
} from "../controllers/logController.js";
import { protect } from "../middleware/Auth.js";

const router = express.Router();

router.use(protect);

router.post("/", markComplete);
router.delete("/", unmarkComplete);
router.get("/today", getTodayLogs);
router.get("/range", getRangeLogs);
router.get("/heatmap", getHeatmap);
router.get("/stats", getStats);
router.get("/stats/:habitId", getHabitStats);

export default router;