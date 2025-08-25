// src/components/TripCategories.jsx
import React, { useMemo, useState } from "react";
import TripItem from "./TripItem";

export default function TripCategories({ trips, onDelete, onEdit, onUpdateChecked }) {
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

        const uniqueDates = Array.from(
          new Set(list.map((t) => (t.date ? String(t.date).slice(0, 10) : "")))
        )
          .filter(Boolean)
          .sort();

        const titleRange =
          uniqueDates.length > 0
            ? ` (${uniqueDates[0]} ~ ${uniqueDates[uniqueDates.length - 1]})`
            : "";

        return (
          <div key={name} style={{ border: "1px solid #eee", borderRadius: 8 }}>
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

            {opened && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                {uniqueDates.map((date, idx) => {
                  const items = list.filter(
                    (t) => t.date && String(t.date).slice(0, 10) === date
                  );
                  return (
                    <div key={date} style={{ border: "1px dashed #e5e5e5", borderRadius: 8, padding: 10 }}>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
