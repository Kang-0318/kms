import dayjs from "dayjs";
import React, { useMemo } from "react";
import "./Header.css"; // 👈 CSS 불러오기

function buildDates(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const s = dayjs(startDate);
  const e = dayjs(endDate);
  const diff = e.diff(s, "day");
  return Array.from({ length: diff + 1 }, (_, i) =>
    s.add(i, "day").format("YYYY-MM-DD")
  );
}

// D-? 계산: startDate 기준
function getDDayText(startDate) {
  if (!startDate) return "";
  const today = dayjs().startOf("day");
  const s = dayjs(startDate, "YYYY-MM-DD", true).startOf("day");
  if (!s.isValid()) return "";
  const diff = s.diff(today, "day");
  if (diff === 0) return "D-day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function Header({
  startDate,
  endDate,
  onRangeChange,
  onSelectDay,
  hideDayPreview = false, // 상단 Day 미리보기 숨길지
  onHome,                 // ← 홈 버튼 콜백
}) {
  const dates = useMemo(() => buildDates(startDate, endDate), [startDate, endDate]);
  const dday = getDDayText(startDate);

  return (
    <div className="Header">
      {/* Top bar */}
      <div className="top-bar">
        <button type="button" onClick={onHome} className="home-btn">
          여행 <span role="img" aria-label="emoji">🧳</span>
        </button>
        {!!dday && <div className="dday">{dday}</div>}
      </div>

      {/* 날짜 선택 */}
      <div className="date-range">
        <input
          type="date"
          value={startDate || ""}
          onChange={(e) => onRangeChange(e.target.value, endDate)}
        />
        <span>~</span>
        <input
          type="date"
          value={endDate || ""}
          onChange={(e) => onRangeChange(startDate, e.target.value)}
        />
      </div>

      {/* 비행기 애니메이션 추가 */}
      <div className="airplane" aria-label="airplane" role="img">✈️</div>

      {/* Day 미리보기 */}
      {!hideDayPreview && dates.length > 0 && (
        <div className="day-list">
          {dates.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDay?.(i + 1, d)}
              className="day-item"
            >
              <b>Day {i + 1}</b> <span style={{ color: "#777" }}>{d}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
