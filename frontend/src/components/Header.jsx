// src/components/Header.jsx
import dayjs from "dayjs";
import React, { useMemo } from "react";

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
  if (diff === 0) return "D‑day";
  if (diff > 0) return `D‑${diff}`;
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
    <div className="Header" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Top bar: 홈 버튼 + D-? */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 4,
        }}
      >
        <button
          type="button"
          onClick={onHome}
          title="홈으로"
          style={{
            background: "transparent",
            border: "none",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          여행 <span role="img" aria-label="emoji">🧳</span>
        </button>
        {!!dday && (
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#111",
              minWidth: 56,
              textAlign: "right",
            }}
          >
            {dday}
          </div>
        )}
      </div>

      {/* 날짜 선택 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      {/* Day 미리보기(옵션) */}
      {!hideDayPreview && dates.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dates.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDay?.(i + 1, d)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #eee",
                background: "#fff",
              }}
            >
              <b>Day {i + 1}</b> <span style={{ color: "#777" }}>{d}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
