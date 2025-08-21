// src/App.jsx
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import TodoEditor from "./components/TodoEditor";
import TodoList from "./components/TravelList";

// 환경변수 끝 슬래시 방지
function normalizeBase(url) {
  return url?.replace(/\/+$/, "") ?? "";
}

// "YYYY-MM-DD" + dayjs 시간 → JS Date
function combineDateAndTime(dateStr, timeDayjs) {
  const base = dateStr ? dayjs(dateStr) : dayjs();        // 날짜(없으면 오늘)
  const t = timeDayjs ?? dayjs();                          // 시각
  return base
    .hour(t.hour())
    .minute(t.minute())
    .second(0)
    .millisecond(0)
    .toDate();
}

export default function App() {
  const baseURL = normalizeBase(import.meta.env.VITE_API_URL);
  const API = `${baseURL}/api/todos`;

  const [todos, setTodos] = useState([]);

  // 여행 기간 & 선택된 Day 상태
  const [startDate, setStartDate] = useState("");      // yyyy-mm-dd
  const [endDate, setEndDate] = useState("");          // yyyy-mm-dd
  const [selectedDay, setSelectedDay] = useState(null);    // 숫자 (1부터)
  const [selectedDate, setSelectedDate] = useState(null);  // yyyy-mm-dd

  // 목록 불러오기
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await axios.get(API);
        const data = Array.isArray(res.data) ? res.data : res.data?.todos ?? [];
        setTodos(data);
      } catch (error) {
        console.error("가져오기 실패", error);
      }
    };
    fetchTodos();
  }, [API]);

  // Day 클릭 시 선택 상태 반영
  const handleSelectDay = (dayNo, dateStr) => {
    setSelectedDay(dayNo);
    setSelectedDate(dateStr);
  };

  // 기간 변경
  const handleRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedDay(null);
    setSelectedDate(null);
  };

  // 선택된 날짜/Day의 투두만 필터링
  const filteredTodos = useMemo(() => {
    if (!selectedDate && !selectedDay) return todos;

    return todos.filter((t) => {
      const tDate =
        t.date || t.targetDate || t.when || t.tripDate || t.createdDate;
      const tDayNo = t.dayNo || t.day || t.dayIndex;

      if (selectedDate && tDate) return String(tDate).slice(0, 10) === selectedDate;
      if (selectedDay && tDayNo) return Number(tDayNo) === Number(selectedDay);
      return false;
    });
  }, [todos, selectedDate, selectedDay]);

  // 추가: 선택한 날짜 + 입력한 시간으로 저장
  const onCreate = async (todoText, timeDayjs) => {
    if (!todoText?.trim()) return;
    try {
      const payload = {
        text: todoText.trim(),
        date: combineDateAndTime(selectedDate, timeDayjs),
      };
      if (selectedDay) payload.dayNo = selectedDay;

      const res = await axios.post(API, payload);
      const created = res.data?.todo ?? res.data;

      if (Array.isArray(res.data?.todos)) {
        setTodos(res.data.todos);
      } else {
        setTodos((prev) => [created, ...prev]);
      }
    } catch (error) {
      console.error("추가 실패", error);
    }
  };

  // 수정: 텍스트 + 시간 동시 수정
  const onEdit = async (id, newText, newTimeDayjs, baseDateISO) => {
    if (!newText?.trim()) return;
    try {
      // 기존 아이템의 날짜 부분을 유지하면서 시간만 교체 (baseDateISO 없으면 선택된 날짜)
      const baseDateStr = baseDateISO ? String(baseDateISO).slice(0, 10) : selectedDate;
      const update = {
        text: newText.trim(),
        date: combineDateAndTime(baseDateStr, newTimeDayjs),
      };

      const { data } = await axios.put(`${API}/${id}`, update);
      const updated = data?.todo ?? data?.updated ?? data;

      setTodos((prev) =>
        prev.map((t) => (String(t._id) === String(updated._id) ? updated : t))
      );
    } catch (error) {
      console.error("수정 실패", error);
    }
  };

  // 완료 체크 토글
  const onToggle = async (id, nextChecked) => {
    try {
      const { data } = await axios.patch(`${API}/${id}/check`, {
        isCompleted: nextChecked,
      });
      const updated = data?.todo ?? data;

      setTodos((prev) =>
        prev.map((t) => (String(t._id) === String(updated._id) ? updated : t))
      );
    } catch (error) {
      console.error("체크 토글 실패", error);
    }
  };

  // 삭제
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

      {selectedDay && selectedDate && (
        <p style={{ margin: "8px 0 12px" }}>
          선택한 일정: <b>Day {selectedDay}</b> ({selectedDate})
        </p>
      )}

      {/* TodoEditor는 onCreate(text, timeDayjs) 형태로 콜백 호출해야 합니다 */}
      <TodoEditor onCreate={onCreate} />

      <TodoList
        todos={filteredTodos}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggle={onToggle}
      />
    </div>
  );
}
