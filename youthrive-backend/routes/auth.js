import express from "express";
import { register, login, getMe, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/Auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

export default router;