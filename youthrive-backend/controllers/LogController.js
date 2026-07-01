import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import { todayKey, last90Days, streakFromKeys } from "../utils/dateHelpers.js";

export const markComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;

    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const completedDate = date || todayKey();

    const existing = await HabitLog.findOne({ habitId, userId: req.user._id, completedDate });
    if (existing) return res.json(existing);

    const log = await HabitLog.create({ habitId, userId: req.user._id, completedDate });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unmarkComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();

    await HabitLog.findOneAndDelete({ habitId, userId: req.user._id, completedDate });
    res.json({ message: "Unmarked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTodayLogs = async (req, res) => {
  try {
    const today = todayKey();
    const logs = await HabitLog.find({ userId: req.user._id, completedDate: today });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRangeLogs = async (req, res) => {
  try {
    const { start, end } = req.query;
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: start, $lte: end },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHeatmap = async (req, res) => {
  try {
    const keys = last90Days();
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $in: keys },
    });

    const counts = {};
    logs.forEach((log) => {
      counts[log.completedDate] = (counts[log.completedDate] || 0) + 1;
    });

    const result = keys.map((date) => ({ date, count: counts[date] || 0 }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const days30 = last90Days().slice(-30);
    const start = days30[0];
    const end = days30[days30.length - 1];

    const habits = await Habit.find({ userId: req.user._id, isArchived: false });

    const perHabit = await Promise.all(
      habits.map(async (h) => {
        const logs = await HabitLog.find({
          habitId: h._id,
          userId: req.user._id,
          completedDate: { $gte: start, $lte: end },
        });

        const keys = logs.map((l) => l.completedDate).sort().reverse();
        const { current, longest } = streakFromKeys(keys);

        return {
          habitId: h._id,
          name: h.name,
          icon: h.icon,
          color: h.color,
          category: h.category,
          completions30d: logs.length,
          currentStreak: current,
          longestStreak: longest,
        };
      })
    );

    res.json({ perHabit, days: days30 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabitStats = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logs = await HabitLog.find({ habitId: habit._id, userId: req.user._id }).sort({
      completedDate: -1,
    });

    const keys = logs.map((l) => l.completedDate);
    const { current, longest } = streakFromKeys(keys);

    res.json({
      habit,
      totalCompletions: logs.length,
      currentStreak: current,
      longestStreak: longest,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
