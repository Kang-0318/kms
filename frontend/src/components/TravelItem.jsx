import React, { useMemo, useState } from "react";
import EditModal from "./EditModal";
import "./TodoItem.css";

const TodoItem = ({ todo, onDelete, onEdit, onToggle }) => {
  const [open, setOpen] = useState(false);

  const displayDate = useMemo(() => {
    try {
      if (!todo?.date) return "";
      const d = new Date(todo.date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("ko-KR");
    } catch {
      return "";
    }
  }, [todo?.date]);

  const handleSave = (newText, newTimeDayjs) => {
    onEdit?.(todo._id, newText, newTimeDayjs, todo.date);
    setOpen(false);
  };

  return (
    <li className="TodoItem">
      <input
        className="todo-checkbox"
        type="checkbox"
        checked={!!todo?.isCompleted}
        onChange={(e) => onToggle?.(todo._id, e.target.checked)}
        aria-label="완료 토글"
      />

      <div className="content-wrap">
        <div
          className="content"
          style={{ textDecoration: todo?.isCompleted ? "line-through" : "none" }}
          title={todo?.text || ""}
        >
          {todo?.text || ""}
        </div>

        <div className="date" aria-label="마감일">
          {toDisplayDate(todo?.date)}
        </div>
      </div>

      <div className="btn-wrap">
        <button className="updateBtn" onClick={() => setOpen(true)}>
          수정
        </button>
        <button
          className="deleteBtn"
          onClick={() => onDelete?.(todo._id)}
        >
          삭제
        </button>
      </div>

      {/* 수정은 모달에서만 처리 */}
      <EditModal
        open={open}
        initialText={todo?.text || ""}
        initialDate={new Date(todo?.date || Date.now())}
        onClose={() => setOpen(false)}
        onSave={(newText, newTime) => {
          // newTime이 dayjs면 Date로, 문자열이면 Date로 파싱
          const newDate = isDayjs(newTime)
            ? newTime.toDate()
            : new Date(newTime);

          // 기존 시그니처 유지: (id, newText, newDate, oldDate)
          onEdit?.(todo._id, newText, newDate, todo?.date);
          setOpen(false);
        }}
      />
    </li>
  );
};

export default TodoItem;
