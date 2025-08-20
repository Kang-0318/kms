// src/components/TodoItem.jsx
import React, { useMemo, useState } from "react";
import EditModal from "./EditModal";
import "./TodoItem.css";

const TodoItem = ({ todo, onDelete, onEdit, onToggle }) => {
  const [open, setOpen] = useState(false);

  // 안전한 날짜 포맷팅 (date가 없거나 이상하면 빈 문자열)
  const displayDate = useMemo(() => {
    try {
      if (!todo?.date) return "";
      const d = new Date(todo.date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString(); // 필요하면 'ko-KR' 로케일 명시 가능
      // return d.toLocaleString("ko-KR");
    } catch {
      return "";
    }
  }, [todo?.date]);

  const handleToggle = (e) => {
    onToggle?.(todo._id, e.target.checked);
  };

  const handleDelete = () => {
    onDelete?.(todo._id);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = (newText, newTimeDayjs) => {
    // App에서 기존 날짜(YYYY-MM-DD) + 새 시각을 합쳐서 저장
    onEdit?.(todo._id, newText, newTimeDayjs, todo.date);
    setOpen(false);
  };

  return (
    <div className="TodoItem">
      <input
        type="checkbox"
        checked={!!todo.isCompleted}
        onChange={handleToggle}
        aria-label="완료 토글"
      />

      <div
        className="content"
        style={{ textDecoration: todo.isCompleted ? "line-through" : "none" }}
        title={todo.text}
      >
        {todo.text}
      </div>

      <div className="date">{displayDate}</div>

      <div className="btn-wrap">
        <button className="updateBtn" onClick={handleOpen}>
          수정
        </button>
        <button className="deleteBtn" onClick={handleDelete}>
          삭제
        </button>
      </div>

      {/* 수정 모달: 텍스트 + 시간 수정 */}
      <EditModal
        open={open}
        initialText={todo.text}
        initialDate={todo.date}   // 현재 항목의 날짜/시간으로 TimePicker 초기화
        onClose={handleClose}
        onSave={handleSave}       // (newText, newTimeDayjs) 전달됨
      />
    </div>
  );
};

export default TodoItem;
