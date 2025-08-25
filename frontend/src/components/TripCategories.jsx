// src/components/TripCategories.jsx
import React, { useMemo, useState } from "react";
import TripItem from "./TripItem";

export default function TripCategories({
  trips,
  onDelete,
  onEdit,
  onToggle,
  query,
}) {
  const [openName, setOpenName] = useState(null);

  // name -> [trip, trip, ...]
  const groups = useMemo(() => {
    const g = new Map();
    for (const t of trips) {
      const key = (t.name ?? t.text ?? "이름없음").trim();
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(t);
    }
    // 날짜 오름차순 정렬
    for (const [k, arr] of g) {
      arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return g;
  }, [trips]);

  // 검색어가 있으면 여행명으로 필터
  const names = useMemo(() => {
    const all = Array.from(groups.keys());
    if (!query?.trim()) return all;
    const q = query.trim().toLowerCase();
    return all.filter((n) => n.toLowerCase().includes(q));
  }, [groups, query]);

  if (!names.length) return <p style={{ marginTop: 12 }}>표시할 여행명이 없습니다.</p>;

  return (
    <div className="TripCategories" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {names.map((name) => {
        const list = groups.get(name) ?? [];
        const opened = openName === name;

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
              {name} <span style={{ color: "#888" }}>({list.length})</span>
            </button>

            {opened && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {list.map((trip) => (
                  <TripItem
                    key={trip._id ?? trip.id}
                    trip={trip}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
