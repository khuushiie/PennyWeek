const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Budget = require("../models/Budget");

// Get all budgets for user
router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (err) {
    console.error("Budgets route error:", err.message);
    res.status(500).send("Server Error");
  }
});

// Add a budget
router.post("/", auth, async (req, res) => {
  const { category, amount } = req.body;
  try {
    const budget = new Budget({
      userId: req.user.id,
      category,
      amount,
    });
    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    console.error("Budgets route error:", err.message);
    res.status(400).json({ message: "Invalid budget data" });
  }
});

module.exports = router;
