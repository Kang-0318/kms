// src/App.jsx
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
<<<<<<< HEAD
import TodoEditor from "./components/TodoEditor";
import TodoList from "./components/TravelList";
=======
import TripEditor from "./components/TripEditor";
import TripList from "./components/TripList";
>>>>>>> f5fd5d1240bd26726d26dc36cdb7c1fcf4c9b4e7

// 환경변수 끝 슬래시 방지
function normalizeBase(url) {
  return url?.replace(/\/+$/, "") ?? "";
}

// "YYYY-MM-DD" + dayjs 시간 → JS Date
function combineDateAndTime(dateStr, timeDayjs) {
  const base = dateStr ? dayjs(dateStr) : dayjs(); // 날짜(없으면 오늘)
  const t = timeDayjs ?? dayjs(); // 시각
  return base
    .hour(t.hour())
    .minute(t.minute())
    .second(0)
    .millisecond(0)
    .toDate();
}

export default function App() {
  const baseURL = normalizeBase(import.meta.env.VITE_API_URL);
  const API = `${baseURL}/api/trips`;

  const [trips, setTrips] = useState([]);

  // 여행 기간 & 선택된 Day 상태
  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState(""); // yyyy-mm-dd
  const [selectedDay, setSelectedDay] = useState(null); // 숫자 (1부터)
  const [selectedDate, setSelectedDate] = useState(null); // yyyy-mm-dd

  // 목록 불러오기
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(API);
        // 서버가 { trips: [...] } 또는 [] 형태 모두 대응
        const data = Array.isArray(res.data) ? res.data : res.data?.trips ?? [];
        setTrips(data);
      } catch (error) {
        console.error("가져오기 실패", error);
      }
    };
    fetchTrips();
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

  // 선택된 날짜/Day의 여행 항목만 필터링
  const filteredTrips = useMemo(() => {
    if (!selectedDate && !selectedDay) return trips;

    return trips.filter((t) => {
      const tDate =
        t.date || t.targetDate || t.when || t.tripDate || t.createdDate;
      const tDayNo = t.dayNo || t.day || t.dayIndex;

      if (selectedDate && tDate)
        return String(tDate).slice(0, 10) === selectedDate;
      if (selectedDay && tDayNo)
        return Number(tDayNo) === Number(selectedDay);
      return false;
    });
  }, [trips, selectedDate, selectedDay]);

  // 추가: 선택한 날짜 + 입력한 시간으로 저장 (여행명 name 필드 사용)
  const onCreate = async (tripName, timeDayjs) => {
    const name = tripName?.trim();
    if (!name) return;
    try {
      const payload = {
        name, // ✅ 여행명
        text: name, // (서버가 text만 읽는 구버전 호환)
        date: combineDateAndTime(selectedDate, timeDayjs),
      };
      if (selectedDay) payload.dayNo = selectedDay;

      const res = await axios.post(API, payload);
      const created = res.data?.trip ?? res.data;

      if (Array.isArray(res.data?.trips)) {
        setTrips(res.data.trips);
      } else {
        setTrips((prev) => [created, ...prev]);
      }
    } catch (error) {
      console.error("추가 실패", error);
    }
  };

  // 수정: 여행명(name) + 시간 동시 수정
  const onEdit = async (id, newName, newTimeDayjs, baseDateISO) => {
    const name = newName?.trim();
    if (!name) return;
    try {
      // 기존 날짜 부분 유지하면서 시간 교체 (baseDateISO 없으면 선택된 날짜)
      const baseDateStr = baseDateISO
        ? String(baseDateISO).slice(0, 10)
        : selectedDate;
      const update = {
        name,
        text: name, // (구버전 호환)
        date: combineDateAndTime(baseDateStr, newTimeDayjs),
      };

      const { data } = await axios.put(`${API}/${id}`, update);
      const updated = data?.trip ?? data?.updated ?? data;

      setTrips((prev) =>
        prev.map((t) => (String(t._id) === String(updated._id) ? updated : t))
      );
    } catch (error) {
      console.error("수정 실패", error);
    }
  };

  // 완료 체크 토글 (필요 시 유지)
  const onToggle = async (id, nextChecked) => {
    try {
      const { data } = await axios.patch(`${API}/${id}/check`, {
        isCompleted: nextChecked,
      });
      const updated = data?.trip ?? data;

      setTrips((prev) =>
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

      if (Array.isArray(data?.trips)) {
        setTrips(data.trips);
        return;
      }
      const deletedId = data?.deletedId ?? data?.trip?._id ?? data?._id ?? id;
      setTrips((prev) => prev.filter((t) => t._id !== deletedId));
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

      {/* TripEditor는 onCreate(name, timeDayjs) 형태로 콜백 호출 */}
      <TripEditor onCreate={onCreate} />

      <TripList
        trips={filteredTrips}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggle={onToggle}
      />
    </div>
  );
}
