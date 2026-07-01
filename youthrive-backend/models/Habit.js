import mongoose from "mongoose";

const CATEGORIES = [
  "Health",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Productivity",
  "Social",
  "Finance",
  "Creativity",
  "Other",
];

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, enum: CATEGORIES, default: "Health" },
    frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
    targetDays: { type: Number, default: 7, min: 1, max: 7 },
    icon: { type: String, default: "⭐" },
    color: { type: String, default: "#6366f1" },
    isArchived: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const HABIT_CATEGORIES = CATEGORIES;
export default mongoose.model("Habit", habitSchema);