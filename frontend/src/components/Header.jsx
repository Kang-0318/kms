import { useMemo } from "react";

function toNoon(d) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function daysBetweenInclusive(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const s = toNoon(startStr);
  const e = toNoon(endStr);
  const diff = e - s;
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function addDays(dateStr, n) {
  const d = toNoon(dateStr);
  d.setDate(d.getDate() + n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Header({
  startDate,
  endDate,
  onRangeChange, // (start, end) => void
  onSelectDay,   // (dayNo, dateStr) => void
}) {
  const ddayText = useMemo(() => {
    if (!startDate) return "날짜를 선택하세요 ✈️";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(startDate);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return "D-Day 🎉";
    return `D+${Math.abs(diffDays)}`;
  }, [startDate]);

  const dayCount = useMemo(
    () => daysBetweenInclusive(startDate, endDate),
    [startDate, endDate]
  );

  const dayList = useMemo(() => {
    if (dayCount <= 0) return [];
    return Array.from({ length: dayCount }, (_, i) => ({
      label: `Day ${i + 1}`,
      date: addDays(startDate, i),
    }));
  }, [dayCount, startDate]);

  return (
    <header className="header">
      <h3>여행 날짜 🗓️</h3>
      <h1>{ddayText}</h1>

      <div className="date-range" style={{ marginTop: 8 }}>
        <label>
          시작일&nbsp;
          <input
            type="date"
            value={startDate}
            onChange={(e) => onRangeChange?.(e.target.value, endDate)}
            max={endDate || undefined}
          />
        </label>
        <span style={{ margin: "0 8px" }}>~</span>
        <label>
          종료일&nbsp;
          <input
            type="date"
            value={endDate}
            onChange={(e) => onRangeChange?.(startDate, e.target.value)}
            min={startDate || undefined}
          />
        </label>
      </div>

      <div className="day-list">
        {dayList.length === 0 ? (
          <p style={{ color: "#888", marginTop: 12 }}>
            기간을 선택하면 Day 1, Day 2…가 생성됩니다.
          </p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 12 }}>
            {dayList.map((d, idx) => (
              <li
                key={d.date}
                className="day-item"
                onClick={() => onSelectDay?.(idx + 1, d.date)}
                style={{
                  cursor: "pointer",
                  padding: "8px 10px",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  marginBottom: 6,
                }}
              >
                <strong>{d.label}</strong>
                <span style={{ marginLeft: 8 }}>{d.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  /* header edit test2 */
  
  );
}


