import express from "express";
import {
  getWeeklyReport,
  getHabitSuggestions,
  getRecoveryPlan,
  chatAnalysis,
  getMorningMotivation,
} from "../controllers/aiController.js";
import { protect } from "../middleware/Auth.js";

const router = express.Router();

router.use(protect);

router.get("/weekly-report", getWeeklyReport);
router.post("/suggestions", getHabitSuggestions);
router.get("/recovery-plan/:habitId", getRecoveryPlan);
router.post("/chat", chatAnalysis);
router.get("/morning", getMorningMotivation);

export default router;