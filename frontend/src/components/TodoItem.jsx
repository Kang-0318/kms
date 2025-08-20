import React, { useState } from "react";
import EditModal from "./EditModal";
import "./TodoItem.css";

const TodoItem = ({ todo, onDelete, onEdit, onToggle }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="TodoItem">
      <input
        type="checkbox"
        checked={!!todo.isCompleted}
        onChange={(e) => onToggle?.(todo._id, e.target.checked)}
      />
      <div
        className="content"
        style={{ textDecoration: todo.isCompleted ? "line-through" : "none" }}
      >
        {todo.text}
      </div>
      <div className="date">
        {todo.date ? new Date(todo.date).toLocaleString() : ""}
      </div>
      <div className="btn-wrap">
        <button className="updateBtn" onClick={() => setOpen(true)}>
          수정
        </button>
        <button className="deleteBtn" onClick={() => onDelete(todo._id)}>
          삭제
        </button>
      </div>

      {/* 수정 모달 */}
      <EditModal
        open={open}
        initialText={todo.text}
        onClose={() => setOpen(false)}
        onSave={(newText) => {
          onEdit?.(todo._id, newText);
          setOpen(false);
        }}
      />
    </div>
  );
};

export default TodoItem;
