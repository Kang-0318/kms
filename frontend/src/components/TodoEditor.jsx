import dayjs from "dayjs";
import React, { useState } from "react";
import TimeSelect from "./TimeSelect";
import "./TodoEditor.css";

const TodoEditor = ({ onCreate, defaultTime }) => {
  const [text, setText] = useState("");
  const [time, setTime] = useState(defaultTime ?? dayjs().hour(0).minute(0)); // 기본 00:00

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    // onCreate에 시간(dayjs)도 같이 넘겨줌
    onCreate(text.trim(), time);
    setText("");
  };

  return (
    <form className="TodoEditor" onSubmit={onSubmit} style={{display:"flex", gap:8}}>
      <TimeSelect value={time} onChange={setTime} label="시간" />
      <input
        type="text"
        placeholder="새로운 Todo..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1 }}
      />
      <button type="submit" disabled={!text.trim()}>추가</button>
    </form>
  );
};

export default TodoEditor;
