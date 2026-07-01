import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";


export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isArchived: false }).sort({ order: 1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const createHabit = async (req, res) => {
  try {
    const { name, description, category, frequency, targetDays, icon, color } = req.body;

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      description,
      category,
      frequency,
      targetDays,
      icon,
      color,
    });

    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const { name, description, category, frequency, targetDays, icon, color, order } = req.body;

    if (name) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (category) habit.category = category;
    if (frequency) habit.frequency = frequency;
    if (targetDays) habit.targetDays = targetDays;
    if (icon) habit.icon = icon;
    if (color) habit.color = color;
    if (order !== undefined) habit.order = order;

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    await habit.deleteOne();
    await HabitLog.deleteMany({ habitId: req.params.id });

    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const toggleHabit = async (req, res) => {
  try {
    const { date } = req.body;

    const existing = await HabitLog.findOne({
      habitId: req.params.id,
      userId: req.user._id,
      completedDate: date,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ completed: false });
    }

    await HabitLog.create({
      habitId: req.params.id,
      userId: req.user._id,
      completedDate: date,
    });

    res.json({ completed: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getLogs = async (req, res) => {
  try {
    const logs = await HabitLog.find({ userId: req.user._id }).sort({ completedDate: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reorderHabits = async (req, res) => {
  try {
    const { habits } = req.body;

    await Promise.all(
      habits.map(({ _id, order }) =>
        Habit.findOneAndUpdate({ _id, userId: req.user._id }, { order })
      )
    );

    res.json({ message: "Reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};