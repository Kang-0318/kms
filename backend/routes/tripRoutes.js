// backend/routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Trip = require("../models/trip");

const ensureObjectId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: "유효하지 않은 ID형식입니다." });
    return false;
  }
  return true;
};

// READ (전체)
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().sort({ date: 1, createdAt: 1 });
    res.status(200).json(trips);
  } catch (e) {
    res.status(400).json({ error: "데이터 조회 실패" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    let { name, text, date, isCompleted } = req.body;
    name = (name ?? "").toString().trim();
    text = (text ?? "").toString().trim();

    if (!name) return res.status(400).json({ message: "name은 필수입니다." });
    if (!text) return res.status(400).json({ message: "text는 필수입니다." });
    if (!date) return res.status(400).json({ message: "date는 필수입니다." });

    const trip = new Trip({
      name,
      text,
      date: new Date(date),
      ...(typeof isCompleted === "boolean" ? { isCompleted } : {}),
    });
    const saved = await trip.save();
    res.status(201).json(saved);
  } catch (e) {
    res.status(400).json({ error: "여행 저장 실패" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ensureObjectId(id, res)) return;

    const update = {};
    if (typeof req.body.name === "string") update.name = req.body.name.trim();
    if (typeof req.body.text === "string") update.text = req.body.text.trim();
    if (req.body.date) update.date = new Date(req.body.date);
    if (typeof req.body.isCompleted === "boolean") update.isCompleted = req.body.isCompleted;

    const updated = await Trip.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "해당 Id의 trip가 없습니다." });

    res.status(200).json(updated);
  } catch (e) {
    res.status(400).json({ error: "수정 실패" });
  }
});


// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ensureObjectId(id, res)) return;

    const deleted = await Trip.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "해당 Id의 trip가 없습니다." });
    }

    // 프론트는 res 바디를 안 써도 되지만, 편의를 위해 id 반환
    return res.status(200).json({ deletedId: id });
  } catch (e) {
    return res.status(400).json({ error: "삭제 실패" });
  }
});

module.exports = router;


module.exports = router;
