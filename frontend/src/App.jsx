// src/App.jsx
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import TripEditor from "./components/TripEditor";
// ✨ TripList 대신 카테고리 뷰
import TripCategories from "./components/TripCategories";

// 환경변수 끝 슬래시 방지
function normalizeBase(url) {
  return url?.replace(/\/+$/, "") ?? "";
}

// "YYYY-MM-DD" + dayjs 시간 → JS Date
function combineDateAndTime(dateStr, timeDayjs) {
  const base = dateStr ? dayjs(dateStr) : dayjs();
  const t = timeDayjs ?? dayjs();
  return base.hour(t.hour()).minute(t.minute()).second(0).millisecond(0).toDate();
}

export default function App() {
  const baseURL = normalizeBase(import.meta.env.VITE_API_URL);
  const API = `${baseURL}/api/trips`;

  const [trips, setTrips] = useState([]);

  // 여행 기간 & 선택된 Day 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // 🔍 여행명 검색어 (이름으로만 필터)
  const [query, setQuery] = useState("");

  // 목록 불러오기
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(API);
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

  // ✨ 선택된 날짜에 매칭되는 여행명 (없으면 null)
  const selectedTripName = useMemo(() => {
    if (!selectedDate) return null;
    const hit = trips.find(
      (t) => t.date && String(t.date).slice(0, 10) === selectedDate
    );
    return hit?.name ?? null;
  }, [trips, selectedDate]);

  // 추가: 선택한 날짜 + 입력한 시간으로 저장 (여행명 name 필드 사용)
  const onCreate = async (tripName, timeDayjs) => {
    const name = tripName?.trim();
    if (!name) return;
    try {
      const payload = {
        name,
        text: name, // (구버전 호환)
        date: combineDateAndTime(selectedDate, timeDayjs),
        ...(selectedDay ? { dayNo: selectedDay } : {}),
      };

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

  // 완료 체크 토글
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

      {/* 🔎 여행명으로 검색 */}
      <div style={{ margin: "10px 0 16px" }}>
        <input
          type="text"
          placeholder="여행명으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", padding: 12, border: "1px solid #eee", borderRadius: 6 }}
        />
      </div>

      {/* 선택 상태: D-N 대신 여행명 우선 표기 */}
      {selectedDate && (
        <p style={{ margin: "8px 0 12px" }}>
          선택한 일정: <b>{selectedTripName ?? (selectedDay ? `Day ${selectedDay}` : "여행 미지정")}</b> ({selectedDate})
        </p>
      )}

      <TripEditor onCreate={onCreate} selectedDate={selectedDate} />

      {/* ✨ 여행명 카테고리(아코디언)로 일정 조작 */}
      <TripCategories
        trips={trips}        // 전체 전달 → 내부에서 name으로 그룹
        query={query}        // 검색어 있으면 여행명으로 필터
        onDelete={onDelete}
        onEdit={onEdit}
        onToggle={onToggle}
      />
    </div>
  );
}
