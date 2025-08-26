
// src/components/TripItem.jsx
import React, { useMemo, useState } from "react";
import "./TripItem.css";

/**
 * props:
 * - trip: {_id, name, text, date, isCompleted}
 * - onDelete(id)
 * - onEdit(id, { text?, dateStr? })
 * - onUpdateChecked(id, nextBool)
 */
export default function TripItem({ trip, onDelete, onEdit, onUpdateChecked }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(trip?.text ?? ""); // ✅ 일정명(text)
  const [dateStr, setDateStr] = useState(() => {
    if (!trip?.date) return "";
    try {
      const d = new Date(trip.date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    } catch {
      return "";
    }
  });

  const isCompleted = !!trip?.isCompleted;

  const startEdit = () => {
    setText(trip?.text ?? ""); // ✅ 편집시에도 text 로드
    if (trip?.date) {
      try {
        const d = new Date(trip.date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setDateStr(`${y}-${m}-${dd}`);
      } catch {
        setDateStr("");
      }
    } else {
      setDateStr("");
    }
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const saveEdit = async () => {
    const payload = {};
    if (typeof text === "string") payload.text = text.trim(); // ✅ text 저장
    if (dateStr) payload.dateStr = dateStr;
    await onEdit?.(trip._id, payload);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };


  const displayDate = useMemo(() => {
    try {
      if (!trip?.date) return "";
      const d = new Date(trip.date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("ko-KR");
    } catch {
      return "";
    }
  }, [trip?.date]);


  // ✅ 화면 표시용: text 우선, 없으면 name 보조
  const displayText = (trip?.text ?? "").trim() || (trip?.name ?? "").trim();

  return (
    <div className={`TripItem ${isCompleted ? "isCompleted" : ""}`}>
      <input
        type="checkbox"
        checked={!!trip?.isCompleted}
        onChange={() => onUpdateChecked?.(trip._id, !trip.isCompleted)}
        readOnly
      />

      {editing ? (
        <div className="edit-wrap">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="수정할 내용을 입력하세요"
          />

          <div className="date">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </div>

          <div className="btn-wrap">
            <button className="updateBtn" onClick={saveEdit}>
              저장하기
            </button>
            <button className="deleteBtn" onClick={cancelEdit}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="content-wrap">
          {/* ✅ 목록에서는 일정명(text) 표시 */}
          <div className="content" title={displayText}>{displayText}</div>
          <div className="date">{displayDate}</div>
          <div className="btn-wrap">
            <button className="updateBtn" onClick={startEdit}>
              수정
            </button>
            <button className="deleteBtn" onClick={() => onDelete?.(trip._id)}>
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripItem