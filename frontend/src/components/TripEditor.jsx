import dayjs from "dayjs";
import React, { useState } from "react";
import TimeSelect from "./TimeSelect";
import "./TripEditor.css";

const TripEditor = ({ onCreate }) => {
  const [text, setText] = useState("");
  const [time, setTime] = useState(dayjs().hour(9).minute(0)); // 기본 09:00

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCreate(text.trim(), time); // 시간 함께 전달
    setText("");
  };

  return (
    <form className="TripEditor" onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
      <TimeSelect value={time} onChange={setTime} />
      <input
        type="text"
        placeholder="여행명 입력..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1 }}
      />
      <button type="submit" disabled={!text.trim()}>
        추가
      </button>
    </form>
  );
};

export default TripEditor;
