// src/components/TripNameAdder.jsx
import React, { useRef, useState } from "react";
import "./TripEditor.css"; // 버튼/인풋 스타일 재사용

export default function TripNameAdder({ onCreateRange, rangeReady }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const ready = rangeReady && !!name.trim();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!ready) return;
    onCreateRange(name.trim());
    setName("");
    inputRef.current?.focus();
  };

  return (
    <form className="TripEditor" onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={"여행명 입력"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ flex: 1 }}
        disabled={!rangeReady}
        autoComplete="off"
        aria-label="여행명 입력"
      />
      <button className="add-Btn" type="submit" disabled={!ready}>
        추가
      </button>
    </form>
  );
}
