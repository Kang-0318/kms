// src/components/TripCategories.jsx
import React, { useMemo, useState } from "react";
import TripItem from "./TripItem";

/**
 * props:
 * - trips: Trip[]
 * - onDelete, onEdit, onUpdateChecked: handlers
 * - allowAdd: boolean  // 첫 화면에서만 true (App.jsx에서 넘김)
 * - onQuickAdd(name, dateStr, text): function
 */
export default function TripCategories({
  trips,
  onDelete,
  onEdit,
  onUpdateChecked,
  allowAdd = false,
  onQuickAdd,
}) {
  const [openName, setOpenName] = useState(null);

  // 여행명으로 그룹핑
  const groups = useMemo(() => {
    const g = new Map();
    for (const t of trips) {
      const key = (t.name ?? "이름없음").trim();
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(t);
    }
    for (const [, arr] of g) {
      arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return g;
  }, [trips]);

  const names = Array.from(groups.keys());
  if (!names.length) return <p style={{ marginTop: 12 }}>등록된 여행명이 없습니다.</p>;

  return (
    <div className="TripCategories" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {names.map((name) => {
        const list = groups.get(name) ?? [];
        const opened = openName === name;

        // 이 여행의 고유 날짜들(오름차순)
        const uniqueDates = Array.from(
          new Set(list.map((t) => (t.date ? String(t.date).slice(0, 10) : "")))
        )
          .filter(Boolean)
          .sort();

        const start = uniqueDates[0] || "";                                // 시작일
        const end = uniqueDates[uniqueDates.length - 1] || "";              // 종료일
        const titleRange = start && end ? ` (${start} ~ ${end})` : "";

        // trip-level quick add (날짜 + 텍스트)용 유니크 네임
        const tripAddDateName = `tripAddDate-${name}`;
        const tripAddTextName = `tripAddText-${name}`;

        return (
          <div key={name} style={{ border: "1px solid #eee", borderRadius: 8 }}>
            {/* 여행명 헤더 */}
            <button
              type="button"
              onClick={() => setOpenName(opened ? null : name)}
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
              {name}
              <span style={{ color: "#888" }}>{titleRange}</span>
              <span style={{ color: "#aaa" }}> ({list.length})</span>
            </button>

            {/* 펼치면 내용 */}
            {opened && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* ✅ 여행명 단위 “날짜 + 일정 추가” 폼 (첫 화면에서만 노출) */}
                {allowAdd && typeof onQuickAdd === "function" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const dateEl = e.currentTarget.elements[tripAddDateName];
                      const textEl = e.currentTarget.elements[tripAddTextName];
                      const dateStr = (dateEl?.value ?? "").trim();
                      const text = (textEl?.value ?? "").trim();
                      if (!dateStr || !text) return;

                      // 범위 체크(선택적으로): start~end 안의 날짜만 허용
                      if (start && end && (dateStr < start || dateStr > end)) {
                        alert(`날짜는 ${start} ~ ${end} 사이로 선택하세요.`);
                        return;
                      }

                      onQuickAdd(name, dateStr, text);
                      e.currentTarget.reset();
                      dateEl?.focus();
                    }}
                    className="TripEditor"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 8,
                      alignItems: "center",
                      padding: 10,
                      border: "1px dashed #e9e9e9",
                      borderRadius: 8,
                      background: "#fff",
                    }}
                  >
                    <input
                      name={tripAddDateName}
                      type="date"
                      defaultValue={start || ""}
                      min={start || undefined}
                      max={end || undefined}
                      style={{ minWidth: 160 }}
                    />
                    <input
                      name={tripAddTextName}
                      type="text"
                      placeholder="일정 내용 입력..."
                    />
                    <button type="submit">추가</button>
                  </form>
                )}

                {/* Day별 섹션 */}
                {(() =>
                  uniqueDates.length === 0 ? (
                    <div style={{ color: "#888" }}>이 여행의 날짜 정보가 없습니다.</div>
                  ) : (
                    uniqueDates.map((date, idx) => {
                      const items = list.filter(
                        (t) => t.date && String(t.date).slice(0, 10) === date
                      );

                      // day-level quick add (첫 화면 전용) — 기존 기능 유지
                      const inputName = `quickText-${name}-${date}`;

                      return (
                        <div
                          key={date}
                          style={{ border: "1px dashed #e5e5e5", borderRadius: 8, padding: 10 }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Day {idx + 1} <span style={{ color: "#777" }}>({date})</span>
                          </div>

                          {items.length === 0 ? (
                            <div style={{ color: "#888" }}>이 날의 일정이 없습니다.</div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {items.map((trip) => (
                                <TripItem
                                  key={trip._id ?? trip.id}
                                  trip={trip}
                                  onDelete={onDelete}
                                  onEdit={onEdit}
                                  onUpdateChecked={onUpdateChecked}
                                />
                              ))}
                            </div>
                          )}

                          {/* 첫 화면에서만 Day 하단 “일정 추가” 폼 (기존) */}
                          {allowAdd && typeof onQuickAdd === "function" && (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const el = e.currentTarget.elements[inputName];
                                const val = (el?.value ?? "").trim();
                                if (!val) return;
                                onQuickAdd(name, date, val);
                                e.currentTarget.reset();
                                el?.focus();
                              }}
                              className="TripEditor"
                              style={{ display: "flex", gap: 8, marginTop: 10 }}
                            >
                              <input
                                name={inputName}
                                type="text"
                                placeholder="이 날짜에 일정 추가..."
                                style={{ flex: 1 }}
                              />
                              <button type="submit">추가</button>
                            </form>
                          )}
                        </div>
                      );
                    })
                  ))()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
t