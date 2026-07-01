import "dotenv/config";
import mongoose from "mongoose";
import { subDays, format } from "date-fns";

import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import AIInsight from "../models/AIInsights.js";

export const DEMO_EMAIL = "demo@youthrive.app";
export const DEMO_PASSWORD = "DemoUser123!";
const DEMO_NAME = "Alex Carter";

const DAYS_OF_HISTORY = 75;
const toKey = (d) => format(d, "yyyy-MM-dd");
const today = new Date();

const HABITS = [
  {
    name: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day",
    category: "Health",
    frequency: "daily",
    targetDays: 7,
    icon: "💧",
    color: "#0ea5e9",
    pattern: (daysAgo) => daysAgo === 0 ? Math.random() < 0.85 : Math.random() < 0.92,
  },
  {
    name: "Morning run",
    description: "30 minutes of cardio to start the day",
    category: "Fitness",
    frequency: "daily",
    targetDays: 5,
    icon: "🏃",
    color: "#ef4444",
    pattern: (daysAgo, date) => {
      const dow = date.getDay();
      if (dow === 0 || dow === 6) return Math.random() < 0.25;
      return Math.random() < 0.78;
    },
  },
  {
    name: "Read 20 pages",
    description: "Keep up the reading habit",
    category: "Learning",
    frequency: "daily",
    targetDays: 7,
    icon: "📚",
    color: "#8b5cf6",
    pattern: (daysAgo) => {
      if (daysAgo > 30) return Math.random() < 0.4;
      if (daysAgo > 10) return Math.random() < 0.6;
      return Math.random() < 0.95;
    },
  },
  {
    name: "Meditate",
    description: "10 minutes of mindfulness",
    category: "Mindfulness",
    frequency: "daily",
    targetDays: 7,
    icon: "🧘",
    color: "#14b8a6",
    pattern: (daysAgo) => {
      if (daysAgo <= 6) return Math.random() < 0.1;
      return Math.random() < 0.88;
    },
  },
  {
    name: "Plan tomorrow",
    description: "Quick end-of-day planning session",
    category: "Productivity",
    frequency: "daily",
    targetDays: 7,
    icon: "🎯",
    color: "#6366f1",
    pattern: () => Math.random() < 0.7,
  },
  {
    name: "Call a friend or family member",
    description: "Stay connected with people who matter",
    category: "Social",
    frequency: "weekly",
    targetDays: 2,
    icon: "📞",
    color: "#ec4899",
    pattern: (daysAgo, date) => {
      const dow = date.getDay();
      if (dow === 3 || dow === 6) return Math.random() < 0.75;
      return false;
    },
  },
  {
    name: "No spending on takeout",
    description: "Cook at home instead of ordering out",
    category: "Finance",
    frequency: "daily",
    targetDays: 5,
    icon: "💰",
    color: "#10b981",
    pattern: () => Math.random() < 0.6,
  },
  {
    name: "Sketch or journal",
    description: "A few minutes of creative output",
    category: "Creativity",
    frequency: "daily",
    targetDays: 4,
    icon: "✍️",
    color: "#f59e0b",
    pattern: () => Math.random() < 0.5,
  },
];

async function seed() {
  await connectDB();
  console.log("🌱 Seeding demo data…");

  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await HabitLog.deleteMany({ userId: existing._id });
    await Habit.deleteMany({ userId: existing._id });
    await AIInsight.deleteMany({ userId: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log("   Removed previous demo user + data.");
  }

  const user = await User.create({
    name: DEMO_NAME,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    morningMotivation: true,
  });
  console.log(`   Created demo user: ${user.email}`);

  const createdHabits = [];
  for (let i = 0; i < HABITS.length; i++) {
    const { pattern, ...habitData } = HABITS[i];
    const habit = await Habit.create({ ...habitData, userId: user._id, order: i });
    createdHabits.push({ habit, pattern });
  }
  console.log(`   Created ${createdHabits.length} habits.`);

  const logDocs = [];
  for (let daysAgo = DAYS_OF_HISTORY; daysAgo >= 0; daysAgo--) {
    const date = subDays(today, daysAgo);
    const key = toKey(date);
    for (const { habit, pattern } of createdHabits) {
      if (pattern(daysAgo, date)) {
        logDocs.push({ userId: user._id, habitId: habit._id, completedDate: key });
      }
    }
  }

  try {
    await HabitLog.insertMany(logDocs, { ordered: false });
    console.log(`   Logged ${logDocs.length} completions across ${DAYS_OF_HISTORY + 1} days.`);
  } catch (err) {
    const failed = err?.writeErrors?.length || 0;
    console.log(`   Logged ${logDocs.length - failed} completions (${failed} skipped duplicates).`);
  }

  console.log("\n✅ Demo data ready!");
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});