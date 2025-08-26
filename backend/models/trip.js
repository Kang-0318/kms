const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    // 여행명 (그룹핑용)
    name: { type: String, required: true, trim: true },

    // 일정명 (리스트에 보일 제목)
    text: { type: String, required: true, trim: true },

    isCompleted: { type: Boolean, default: false },

    date: { type: Date, required: true }, // 각 Day의 날짜/시간
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
