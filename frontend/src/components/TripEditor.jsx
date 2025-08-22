import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import TimeSelect from "./TimeSelect";
import "./TripEditor.css";

const TripEditor = ({ onCreate, selectedDate }) => {
  const [text, setText] = useState("");
  const [time, setTime] = useState(dayjs().hour(9).minute(0)); // 기본 09:00
  const inputRef = useRef(null);

  // YYYY-MM-DD 형식 엄격 검증
  const isValidDate =
    !!selectedDate && dayjs(selectedDate, "YYYY-MM-DD", true).isValid();

  const ready = isValidDate && !!text.trim();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!ready) return;

    onCreate(text.trim(), time); // App에서 selectedDate와 합쳐 저장
    setText("");
    // 필요하면 시간도 초기화하고 싶다면 주석 해제
    // setTime(dayjs().hour(9).minute(0));
    inputRef.current?.focus();
  };

  return (
    <form className="TripEditor" onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
      <TimeSelect value={time} onChange={setTime} />

      <input
        ref={inputRef}
        type="text"
        placeholder={isValidDate ? "여행명 입력..." : "먼저 유효한 날짜를 선택하세요 (YYYY-MM-DD)"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1 }}
        disabled={!isValidDate}         // 날짜 형식이 유효할 때만 입력 가능
        aria-label="여행명 입력"
        autoComplete="off"
      />

      <button type="submit" disabled={!ready} aria-disabled={!ready}>
        추가
      </button>

      <div style={{ alignSelf: "center", color: "#666", whiteSpace: "nowrap" }}>
        {isValidDate ? `선택 날짜: ${selectedDate}` : "날짜 미선택 또는 형식 오류"}
      </div>
    </form>
  );
};

export default TripEditor;
