const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,       // 여행명
    },
    date: {
      type: Date,
      required: true,   // 여행 날짜(시작일 또는 특정 일정)
      default: Date.now,
    },
    dayNo: {
      type: Number,     // 몇 번째 Day인지 (선택)
    },
    isCompleted: {
      type: Boolean,
      default: false,   // 필요 없다면 제거 가능
    },
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
