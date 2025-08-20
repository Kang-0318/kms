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

      <div
        className="todo-content"
        style={{ textDecoration: todo?.isCompleted ? "line-through" : "none" }}
        title={todo?.text || ""}
      >
        {todo?.text}
      </div>

      <div className="todo-date">{displayDate}</div>

      <div className="btn-wrap">
        <button className="updateBtn" onClick={() => setOpen(true)}>
          수정
        </button>
        <button className="deleteBtn" onClick={() => onDelete?.(todo._id)}>
          삭제
        </button>
      </div>

      <EditModal
  open={open}
  initialText={todo.text}
  initialDate={todo.date}
  onClose={() => setOpen(false)}
  onSave={(newText, newTimeDayjs) => {
    onEdit?.(todo._id, newText, newTimeDayjs, todo.date); // ✅ 시간 포함 전달
    setOpen(false);
  }}
/>
    </li>
  );
};

export default TodoItem;