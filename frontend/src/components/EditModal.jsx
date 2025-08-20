import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import TimeSelect from "./TimeSelect"; // MUI TimePicker 컴포넌트

const EditModal = ({ open, initialText, initialDate, onClose, onSave }) => {
  const [text, setText] = useState(initialText || "");
  const [time, setTime] = useState(dayjs(initialDate || new Date()));

  useEffect(() => {
    if (open) {
      setText(initialText || "");
      setTime(dayjs(initialDate || new Date())); // ← 현재 항목 시간으로 초기화
    }
  }, [open, initialText, initialDate]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>할 일 수정 ✏️</h3>
        <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
          <TimeSelect value={time} onChange={setTime} />
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button
            onClick={() => {
              if (text.trim()) onSave(text.trim(), time); // ✅ 시간 함께 전달
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
