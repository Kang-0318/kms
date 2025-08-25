// src/components/TripPlanner.jsx
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import "./TripList.css";

/**
 * props:
 * - startDate, endDate: YYYY-MM-DD
 * - onCommit(name, draftByDate): 저장 버튼 눌렀을 때 호출
 * - rangeReady: 기간 유효 여부
 */
export default function TripPlanner({ startDate, endDate, onCommit, rangeReady }) {
  const [draftName, setDraftName] = useState("");
  // { 'YYYY-MM-DD': [{ text: '...' }, ...] }
  const [draftByDate, setDraftByDate] = useState({});
  const [openDate, setOpenDate] = useState(null);

  // Day1..N 날짜 목록
  const days = useMemo(() => {
    if (!rangeReady) return [];
    const s = dayjs(startDate);
    const e = dayjs(endDate);
    const diff = e.diff(s, "day");
    return Array.from({ length: diff + 1 }, (_, i) => ({
      index: i + 1,
      date: s.add(i, "day").format("YYYY-MM-DD"),
    }));
  }, [startDate, endDate, rangeReady]);

  const addDraft = (date, text) => {
    const v = text.trim();
    if (!v) return;
    setDraftByDate((prev) => {
      const next = { ...prev };
      next[date] = [...(next[date] ?? []), { text: v }];
      return next;
    });
  };

  const removeDraft = (date, idx) => {
    setDraftByDate((prev) => {
      const next = { ...prev };
      next[date] = (next[date] ?? []).filter((_, i) => i !== idx);
      if (next[date]?.length === 0) delete next[date];
      return next;
    });
  };

  const totalDraftCount = Object.values(draftByDate).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  const canCommit = rangeReady && !!draftName.trim() && totalDraftCount > 0;

  const handleSubmitTripName = (e) => {
    e.preventDefault();
    if (!canCommit) return;
    onCommit(draftName.trim(), draftByDate);
    setDraftName("");
    setDraftByDate({});
    setOpenDate(null);
  };

  if (!rangeReady) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 여행명 입력 + 저장 */}
      <form
        onSubmit={handleSubmitTripName}
        className="TripEditor"
        style={{ display: "flex", gap: 8 }}
      >
        <input
          type="text"
          placeholder="여행명 입력..."
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={!canCommit}>
          여행명 추가
        </button>
      </form>

      {/* Day 미리보기 + 일정 입력(계획 모드 전용) */}
      {days.map(({ index, date }) => {
        const opened = openDate === date;
        const list = draftByDate[date] ?? [];
        return (
          <div key={date} style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setOpenDate(opened ? null : date)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                background: "#fafafa",
                border: "none",
                borderBottom: opened ? "1px solid #eee" : "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Day {index} <span style={{ color: "#777" }}>({date})</span>
              {list.length > 0 && (
                <span style={{ marginLeft: 8, color: "#888" }}>
                  임시 일정 {list.length}개
                </span>
              )}
            </button>

            {opened && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {/* 임시 일정 목록 */}
                {list.length === 0 ? (
                  <div style={{ color: "#888" }}>아직 추가한 일정이 없습니다.</div>
                ) : (
                  <div className="trips-wrapper">
                    {list.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 8,
                          alignItems: "center",
                          padding: "8px 10px",
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          background: "#fff",
                        }}
                      >
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.text}
                        </div>
                        <button
                          type="button"
                          className="deleteBtn"
                          onClick={() => removeDraft(date, i)}
                          style={{ padding: "6px 10px" }}
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 이 Day에 일정 추가 입력 */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = (e.target.elements["draftText"]?.value ?? "").trim();
                    if (!val) return;
                    addDraft(date, val);
                    e.target.reset();
                    e.target.elements["draftText"]?.focus();
                  }}
                  className="TripEditor"
                  style={{ display: "flex", gap: 8 }}
                >
                  <input name="draftText" type="text" placeholder="일정 내용 입력..." style={{ flex: 1 }} />
                  <button type="submit">추가</button>
                </form>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
