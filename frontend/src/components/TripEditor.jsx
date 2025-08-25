import React, { useRef, useState } from "react";
import "./TripEditor.css";

const TripEditor = ({ onCreate, selectedDate }) => {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const isValidDate = !!selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
  const ready = isValidDate && !!text.trim();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!ready) return;
    onCreate(text.trim(), undefined); // 시간 없이 호출
    setText("");
    inputRef.current?.focus();
  };

  return (
    <form className="TripEditor" onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={isValidDate ? "여행명 입력..." : "먼저 유효한 날짜를 선택하세요 (YYYY-MM-DD)"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1 }}
        disabled={!isValidDate}
        autoComplete="off"
      />
      <button type="submit" disabled={!ready}>추가</button>
    </form>
  );
};

export default TripEditor;
