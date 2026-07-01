import express from "express";
import { getHabits, createHabit, updateHabit, deleteHabit, toggleHabit, getLogs, reorderHabits } from "../controllers/habitController.js";
import { protect } from "../middleware/Auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getHabits);
router.post("/", createHabit);
router.put("/reorder", reorderHabits);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);
router.post("/:id/toggle", toggleHabit);
router.get("/logs", getLogs);

export default router;