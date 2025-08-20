import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import TodoEditor from "./components/TodoEditor";
import TodoList from "./components/TodoList";

function normalizeBase(url) {
  return url?.replace(/\/+$/, "") ?? "";
}

export default function App() {
  const baseURL = normalizeBase(import.meta.env.VITE_API_URL);
  const API = `${baseURL}/api/todos`;

  const [todos, setTodos] = useState([]);

  // 여행 기간 & 선택된 Day 상태
  const [startDate, setStartDate] = useState("");   // yyyy-mm-dd
  const [endDate, setEndDate] = useState("");       // yyyy-mm-dd
  const [selectedDay, setSelectedDay] = useState(null); // 숫자 (1부터)
  const [selectedDate, setSelectedDate] = useState(null); // yyyy-mm-dd

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await axios.get(API);
        const data = Array.isArray(res.data) ? res.data : res.data?.todos ?? [];
        setTodos(data);
        console.log("todos", data);
      } catch (error) {
        console.log("가져오기 실패", error);
      }
    };
    fetchTodos();
  }, [API]);

  // Day 클릭 시 선택 상태 반영
  const handleSelectDay = (dayNo, dateStr) => {
    setSelectedDay(dayNo);
    setSelectedDate(dateStr);
  };

  // 기간 변경(컨트롤드)
  const handleRangeChange = (s, e) => {
    setStartDate(s);
    setEndDate(e);
    // 기간 바뀌면 선택 초기화
    setSelectedDay(null);
    setSelectedDate(null);
  };

  // 선택된 날짜가 있으면 해당 날짜/Day의 투두만 보여주기
  const filteredTodos = useMemo(() => {
    if (!selectedDate && !selectedDay) return todos;

    return todos.filter((t) => {
      // 서버 스키마가 제각각일 수 있으므로, 날짜 필드 가변 대응
      const tDate =
        t.date || t.targetDate || t.when || t.tripDate || t.createdDate;
      const tDayNo = t.dayNo || t.day || t.dayIndex;

      if (selectedDate && tDate) return String(tDate).slice(0, 10) === selectedDate;
      if (selectedDay && tDayNo) return Number(tDayNo) === Number(selectedDay);
      return false;
    });
  }, [todos, selectedDate, selectedDay]);

  const onCreate = async (todoText) => {
    if (!todoText.trim()) return;

    try {
      // 선택된 Day/날짜가 있으면 함께 저장 (백엔드가 모르는 필드여도 무해)
      const payload = { text: todoText.trim() };
      if (selectedDate) payload.date = selectedDate;
      if (selectedDay) payload.dayNo = selectedDay;

      const res = await axios.post(API, payload);
      const created = res.data?.todo ?? res.data;

      if (Array.isArray(res.data?.todos)) {
        setTodos(res.data.todos);
      } else {
        setTodos((prev) => [created, ...prev]);
      }
    } catch (error) {
      console.log("추가 실패", error);
    }
  };

  const onDelete = async (id) => {
    try {
      if (!confirm("정말 삭제할까요?")) return;

      const { data } = await axios.delete(`${API}/${id}`);

      if (Array.isArray(data?.todos)) {
        setTodos(data.todos);
        return;
      }

      const deletedId = data?.deletedId ?? data?.todo?._id ?? data?._id ?? id;
      setTodos((prev) => prev.filter((t) => t._id !== deletedId));
    } catch (error) {
      console.error("삭제 실패", error);
    }
  };

  return (
    <div className="App">
      <Header
        startDate={startDate}
        endDate={endDate}
        onRangeChange={handleRangeChange}
        onSelectDay={handleSelectDay}
      />

      {/* 선택한 Day/날짜 배지(선택사항) */}
      {selectedDay && selectedDate && (
        <p style={{ margin: "8px 0 12px" }}>
          선택한 일정: <b>Day {selectedDay}</b> ({selectedDate})
        </p>
      )}

      <TodoEditor onCreate={onCreate} />
      <TodoList todos={filteredTodos} onDelete={onDelete} />
    </div>
  );
}
