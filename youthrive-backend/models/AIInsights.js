import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["weeklyReport", "recoveryPlan", "morning", "suggestions", "chat"],
      required: true,
    },
    content: { type: String, required: true },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit" },
  },
  { timestamps: true }
);

export default mongoose.model("AIInsight", aiInsightSchema);