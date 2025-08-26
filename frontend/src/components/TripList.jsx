import React from "react";
import TripItem from "./TripItem";
import "./TripList.css";

const TripList = ({ trips, onDelete, onEdit, onToggle }) => {
  return (
    <div className="TripList">
      <h4>검색 결과</h4>

      {(!trips || trips.length === 0) ? (
        <p style={{ marginTop: 12, color: "#777" }}>
          검색 결과가 없습니다.
        </p>
      ) : (
        <div className="trips-wrapper">
          {trips.map((trip) => (
            <TripItem
              key={trip._id ?? trip.id}
              trip={trip}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;
