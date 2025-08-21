import React from "react";
import TripItem from "./TripItem";
import "./TripList.css";

const TripList = ({ trips, onDelete }) => {
  return (
    <div className="TripList">
      <h4>여행 목록 🌍</h4>
      <input type="text" placeholder="검색어를 입력하세요" />
      <div className="trips-wrapper">
        {trips.map((trip, i) => (
          <TripItem key={trip._id ?? i} trip={trip} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default TripList;
