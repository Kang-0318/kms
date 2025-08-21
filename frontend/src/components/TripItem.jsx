import React, { useMemo, useState } from "react";
import EditModal from "./EditModal";
import "./TripItem.css";

const TripItem = ({ trip, onDelete, onEdit, onToggle }) => {
  const [open, setOpen] = useState(false);

  const displayDate = useMemo(() => {
    try {
      if (!trip?.date) return "";
      const d = new Date(trip.date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("ko-KR");
    } catch {
      return "";
    }
  }, [trip?.date]);

  return (
    <li className="TripItem">
      <input
        className="trip-checkbox"
        type="checkbox"
        checked={!!trip?.isCompleted}
        onChange={(e) => onToggle?.(trip._id, e.target.checked)}
        aria-label="완료 토글"
      />

      <div
        className="trip-content"
        style={{ textDecoration: trip?.isCompleted ? "line-through" : "none" }}
        title={trip?.name || ""}
      >
        {trip?.name}
      </div>

      <div className="trip-date">{displayDate}</div>

      <div className="btn-wrap">
        <button className="updateBtn" onClick={() => setOpen(true)}>
          수정
        </button>
        <button className="deleteBtn" onClick={() => onDelete?.(trip._id)}>
          삭제
        </button>
      </div>

      <EditModal
        open={open}
        initialText={trip.name}
        initialDate={trip.date}
        onClose={() => setOpen(false)}
        onSave={(newText, newTimeDayjs) => {
          onEdit?.(trip._id, newText, newTimeDayjs, trip.date);
          setOpen(false);
        }}
      />
    </li>
  );
};

export default TripItem;
