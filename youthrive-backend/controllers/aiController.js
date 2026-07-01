import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import AIInsight from "../models/AIInsights.js";
import { generateContent, parseJSON, SYSTEM_PROMPTS } from "../utils/aiService.js";
import { last7Days, last90Days, todayKey, streakFromKeys } from "../utils/dateHelpers.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Fetches the user's active habits plus their last 7 days of logs, and
// returns a structured per-habit summary used to build the weekly report
// prompt.
const buildWeeklyContext = async (userId) => {
  const habits = await Habit.find({ userId, isArchived: false }).sort({ order: 1 });
  if (!habits.length) return [];

  const days = last7Days();
  const dayKeys = days.map((d) => d.key);

  const logs = await HabitLog.find({
    userId,
    completedDate: { $in: dayKeys },
  });

  return habits.map((habit) => {
    const completedDays = logs
      .filter((log) => log.habitId.toString() === habit._id.toString())
      .map((log) => log.completedDate)
      .sort();

    return {
      habitId: habit._id,
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      completedDays,
      completedCount: completedDays.length,
      target: habit.targetDays,
    };
  });
};

// ---------------------------------------------------------------------------
// Weekly report
// ---------------------------------------------------------------------------
export const getWeeklyReport = async (req, res) => {
  try {
    const context = await buildWeeklyContext(req.user._id);

    if (!context.length) {
      return res.json({
        content:
          "You don't have any active habits yet. Add a habit and start logging to get your first personalized weekly report!",
      });
    }

    const lines = context.map(
      (h) =>
        `- ${h.name} (${h.category}, ${h.frequency}): completed ${h.completedCount}/${h.target} days this week. Completed on: ${
          h.completedDays.join(", ") || "none"
        }`
    );

    const userMessage = `Here is the user's habit data for the past 7 days:\n\n${lines.join("\n")}`;

    const content = await generateContent(userMessage, SYSTEM_PROMPTS.weekly);

    await AIInsight.create({
      userId: req.user._id,
      type: "weeklyReport",
      content,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// Habit suggestions
// ---------------------------------------------------------------------------
const DEFAULT_SUGGESTIONS = {
  suggestions: [
    {
      icon: "⏱️",
      name: "2-Minute Version",
      category: "General",
      frequency: "Daily",
      description: "Shrink the habit down to a 2-minute version to lower the barrier to starting.",
      reason: "A personalized plan couldn't be generated, so here's a general low-friction strategy.",
    },
    {
      icon: "🔗",
      name: "Habit Stacking",
      category: "General",
      frequency: "Daily",
      description: "Stack it onto something you already do daily, like brushing your teeth or making coffee.",
      reason: "A personalized plan couldn't be generated, so here's a general low-friction strategy.",
    },
    {
      icon: "📍",
      name: "Fixed Time & Place",
      category: "General",
      frequency: "Daily",
      description: "Pick one specific time and place for it so it stops needing a decision each day.",
      reason: "A personalized plan couldn't be generated, so here's a general low-friction strategy.",
    },
  ],
  reasoning:
    "These are general, low-friction strategies for building consistency, used here because a personalized plan couldn't be generated.",
};

export const getHabitSuggestions = async (req, res) => {
  try {
    const { goals, productiveTime, struggles } = req.body;

    const userMessage = `Goals: ${goals || "Not specified"}
Most productive time of day: ${productiveTime || "Not specified"}
Current struggles: ${struggles || "Not specified"}`;

    const text = await generateContent(userMessage, SYSTEM_PROMPTS.suggestion);

    let result;
    try {
      result = parseJSON(text);
    } catch (parseErr) {
      result = DEFAULT_SUGGESTIONS;
    }

    await AIInsight.create({
      userId: req.user._id,
      type: "suggestions",
      content: JSON.stringify(result),
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// Streak recovery plan
// ---------------------------------------------------------------------------
export const getRecoveryPlan = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logs = await HabitLog.find({ habitId: habit._id, userId: req.user._id });
    const keys = logs.map((log) => log.completedDate);
    const { current, longest } = streakFromKeys(keys);

    const userMessage = `Habit: ${habit.name} (${habit.category}).
Current streak: ${current} days.
Longest streak: ${longest} days.`;

    const content = await generateContent(userMessage, SYSTEM_PROMPTS.recovery);

    await AIInsight.create({
      userId: req.user._id,
      type: "recoveryPlan",
      content,
      habitId: habit._id,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// Chat analysis
// ---------------------------------------------------------------------------
export const chatAnalysis = async (req, res) => {
  try {
    const { message } = req.body;

    const habits = await Habit.find({ userId: req.user._id, isArchived: false });

    const days30 = last90Days().slice(-30);
    const start = days30[0];
    const end = days30[days30.length - 1];

    // Overall totals across ALL habits, by day of week
    const totalsByDayOfWeek = DAY_NAMES.reduce((acc, day) => {
      acc[day] = 0;
      return acc;
    }, {});

    const context = await Promise.all(
      habits.map(async (habit) => {
        const logs = await HabitLog.find({
          habitId: habit._id,
          userId: req.user._id,
          completedDate: { $gte: start, $lte: end },
        });

        const completionsByDayOfWeek = DAY_NAMES.reduce((acc, day) => {
          acc[day] = 0;
          return acc;
        }, {});

        logs.forEach((log) => {
          const dayName = DAY_NAMES[new Date(`${log.completedDate}T00:00:00`).getDay()];
          completionsByDayOfWeek[dayName] += 1;
          totalsByDayOfWeek[dayName] += 1;
        });

        return {
          name: habit.name,
          category: habit.category,
          totalCompletions30d: logs.length,
          completionsByDayOfWeek,
        };
      })
    );

    // Precompute the most/least consistent day overall so the model
    // doesn't have to do the math itself (and can just confirm/explain it)
    const sortedDays = Object.entries(totalsByDayOfWeek).sort((a, b) => b[1] - a[1]);
    const mostConsistentDay = sortedDays[0];
    const leastConsistentDay = sortedDays[sortedDays.length - 1];

    const userMessage = `User question: ${message}

Habit data (last 30 days):
${JSON.stringify(context, null, 2)}

Overall totals by day of week (summed across all habits):
${JSON.stringify(totalsByDayOfWeek, null, 2)}

Precomputed: most consistent day overall is ${mostConsistentDay[0]} with ${mostConsistentDay[1]} completions; least consistent day overall is ${leastConsistentDay[0]} with ${leastConsistentDay[1]} completions.`;

    const content = await generateContent(userMessage, SYSTEM_PROMPTS.chat);

    await AIInsight.create({
      userId: req.user._id,
      type: "chat",
      content,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// Morning motivation
// ---------------------------------------------------------------------------
export const getMorningMotivation = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isArchived: false });
    const today = todayKey();

    let completedToday = 0;

    const habitSummaries = await Promise.all(
      habits.map(async (habit) => {
        const logs = await HabitLog.find({ habitId: habit._id, userId: req.user._id });
        const keys = logs.map((log) => log.completedDate);
        const { current } = streakFromKeys(keys);

        if (keys.includes(today)) completedToday += 1;

        return {
          name: habit.name,
          category: habit.category,
          currentStreak: current,
          completedToday: keys.includes(today),
        };
      })
    );

    const userMessage = `Habits and streaks:
${JSON.stringify(habitSummaries, null, 2)}

Progress today: ${completedToday}/${habits.length} habits completed so far.`;

    const content = await generateContent(userMessage, SYSTEM_PROMPTS.morning, {
      temperature: 0.8,
    });

    await AIInsight.create({
      userId: req.user._id,
      type: "morning",
      content,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};