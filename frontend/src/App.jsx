// src/App.jsx
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import TripCategories from "./components/TripCategories";
import TripPlanner from "./components/TripPlanner";

// 환경변수 끝 슬래시 방지
function normalizeBase(url) {
  return url?.replace(/\/+$/, "") ?? "";
}

// 시작~종료 사이 날짜 배열
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
  const [showCategories, setShowCategories] = useState(true); // 리스트 표시 여부

  const rangeDates = useMemo(
    () => buildDateStrings(startDate, endDate),
    [startDate, endDate]
  );
  const rangeReady = rangeDates.length > 0;

  useEffect(() => {
    if (!rangeReady) setShowCategories(true);
  }, [rangeReady]);

  // 초기 목록 불러오기
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

  // 날짜 변경: 계획 모드 진입 → 리스트 숨김
  const handleRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setShowCategories(false);
  };

  // 홈 버튼: 날짜 초기화 + 리스트 표시
  const handleHome = () => {
    setStartDate("");
    setEndDate("");
    setShowCategories(true);
  };

  // (선택) 상단 Day 클릭을 쓰고 싶다면 사용
  const handleSelectDay = (dayNo, dateStr) => {
    console.log("select day", dayNo, dateStr);
  };

  // TripPlanner → 여행명 확정 시 Day별 일정 생성 후 리스트 다시 표시 + 날짜 초기화
  const handleCommit = async (name, draftByDate) => {
    const entries = Object.entries(draftByDate);
    if (entries.length === 0) return;

    try {
      const created = [];
      for (const [date, items] of entries) {
        for (const it of items) {
          const payload = {
            name,               // 여행명(그룹)
            text: it.text,      // ✅ 일정명
            date: new Date(`${date}T00:00:00.000Z`),
          };
          const r = await axios.post(API, payload);
          created.push(r.data?.trip ?? r.data);
        }
      }
      setTrips((prev) => [...created, ...prev]);

      // ✅ 계획 확정 이후: 날짜 초기화 → TripPlanner 사라지고 리스트만 보이게
      setStartDate("");
      setEndDate("");
      setShowCategories(true);
    } catch (e) {
      console.error("여행 생성 실패", e);
    }
  };

  // =========================
  // TripItem 에서 쓸 콜백들
  // =========================

  // 체크 토글 (간단히 PUT으로 isCompleted만 갱신)
  const onUpdateChecked = async (id, nextChecked) => {
    try {
      const { data } = await axios.put(`${API}/${id}`, { isCompleted: nextChecked });
      setTrips((prev) => prev.map((t) => (String(t._id) === String(data._id) ? data : t)));
    } catch (e) {
      console.error("체크 토글 실패", e);
    }
  };

  // 일정 수정(텍스트 + 날짜)
  const onEdit = async (id, update) => {
    // update: { text?: string, dateStr?: 'YYYY-MM-DD' }
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
        hideDayPreview      // 상단 Day 미리보기는 숨김 (계획 모드는 TripPlanner에서)
        onHome={handleHome} // 홈 버튼 동작
      />

      {/* 날짜가 유효할 때만 계획 모드(여행명 + Day별 일정 임시 입력) */}
      {rangeReady && (
        <TripPlanner
          startDate={startDate}
          endDate={endDate}
          rangeReady={rangeReady}
          onCommit={handleCommit}
        />
      )}

      {/* 여행명 카테고리: 날짜를 고르는 동안은 숨김, 추가 후엔 표시 */}
      {showCategories && (
        <div style={{ marginTop: 16 }}>
          <TripCategories
            trips={trips}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateChecked={onUpdateChecked}
          />
        </div>
      )}
    </div>
  );
}
