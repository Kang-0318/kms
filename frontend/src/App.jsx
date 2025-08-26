// src/App.jsx
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import TripCategories from "./components/TripCategories";
import TripPlanner from "./components/TripPlanner";

function normalizeBase(url) {
  return url?.replace(/\/+$/, "") ?? "";
}

function buildDateStrings(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const s = dayjs(startDate, "YYYY-MM-DD", true);
  const e = dayjs(endDate, "YYYY-MM-DD", true);
  if (!s.isValid() || !e.isValid() || e.isBefore(s)) return [];
  const diff = e.diff(s, "day");
  return Array.from({ length: diff + 1 }, (_, i) =>
    s.add(i, "day").format("YYYY-MM-DD")
  );
}

export default function App() {
  const baseURL = normalizeBase(import.meta.env.VITE_API_URL);
  const API = `${baseURL}/api/trips`;

  const [trips, setTrips] = useState([]);
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");     // YYYY-MM-DD
  const [showCategories, setShowCategories] = useState(true);

  const rangeDates = useMemo(
    () => buildDateStrings(startDate, endDate),
    [startDate, endDate]
  );
  const rangeReady = rangeDates.length > 0;

  useEffect(() => {
    if (!rangeReady) setShowCategories(true);
  }, [rangeReady]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(API);
        const data = Array.isArray(res.data) ? res.data : res.data?.trips ?? [];
        setTrips(data);
      } catch (e) {
        console.error("가져오기 실패", e);
      }
    })();
  }, [API]);

  const handleRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setShowCategories(false);
  };

  const handleHome = () => {
    setStartDate("");
    setEndDate("");
    setShowCategories(true);
  };

  const handleSelectDay = (dayNo, dateStr) => {
    console.log("select day", dayNo, dateStr);
  };

  const handleCommit = async (name, draftByDate) => {
    const entries = Object.entries(draftByDate);
    if (entries.length === 0) return;

    try {
      const created = [];
      for (const [date, items] of entries) {
        for (const it of items) {
          const payload = {
            name,
            text: it.text,
            date: new Date(`${date}T00:00:00.000Z`),
          };
          const r = await axios.post(API, payload);
          created.push(r.data?.trip ?? r.data);
        }
      }
      setTrips((prev) => [...created, ...prev]);

      // 여행명 추가 후: 날짜 초기화 + 리스트 표시
      setStartDate("");
      setEndDate("");
      setShowCategories(true);
    } catch (e) {
      console.error("여행 생성 실패", e);
    }
  };

  // ✅ 첫 화면(날짜 미선택)에서 TripCategories → Day 밑 “일정 추가”용
  const onQuickAdd = async (tripName, dateStr, itemText) => {
    const name = (tripName ?? "").trim();
    const text = (itemText ?? "").trim();
    if (!name || !text || !dateStr) return;
    try {
      const payload = {
        name,
        text,
        date: new Date(`${dateStr}T00:00:00.000Z`),
      };
      const { data } = await axios.post(API, payload);
      const created = data?.trip ?? data;
      setTrips((prev) => [created, ...prev]);
    } catch (e) {
      console.error("빠른 일정 추가 실패", e);
    }
  };

  // 체크 토글
  const onUpdateChecked = async (id, nextChecked) => {
    try {
      const { data } = await axios.put(`${API}/${id}`, { isCompleted: nextChecked });
      setTrips((prev) => prev.map((t) => (String(t._id) === String(data._id) ? data : t)));
    } catch (e) {
      console.error("체크 토글 실패", e);
    }
  };

  // 수정
  const onEdit = async (id, update) => {
    try {
      const body = {};
      if (typeof update.text === "string") body.text = update.text.trim();
      if (update.dateStr) body.date = new Date(`${update.dateStr}T00:00:00.000Z`);
      const { data } = await axios.put(`${API}/${id}`, body);
      setTrips((prev) => prev.map((t) => (String(t._id) === String(data._id) ? data : t)));
    } catch (e) {
      console.error("수정 실패", e);
    }
  };

  // 삭제
  const onDelete = async (id) => {
    try {
      if (!confirm("정말 삭제할까요?")) return;
      await axios.delete(`${API}/${id}`);
      setTrips((prev) => prev.filter((t) => String(t._id) !== String(id)));
    } catch (e) {
      console.error("삭제 실패", e);
    }
  };

  return (
    <div className="App">
      <Header
        startDate={startDate}
        endDate={endDate}
        onRangeChange={handleRangeChange}
        onSelectDay={handleSelectDay}
        hideDayPreview
        onHome={handleHome}
      />

      {rangeReady && (
        <TripPlanner
          startDate={startDate}
          endDate={endDate}
          rangeReady={rangeReady}
          onCommit={handleCommit}
        />
      )}

      {showCategories && (
        <div style={{ marginTop: 16 }}>
          <TripCategories
            trips={trips}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateChecked={onUpdateChecked}
            allowAdd={!rangeReady}
            onQuickAdd={onQuickAdd}
          />
        </div>
      )}
    </div>
  );
}
