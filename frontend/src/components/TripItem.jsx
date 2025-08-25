import React, { useEffect, useState, useMemo } from 'react'
import "./TripItem.css"
const TripItem = ({ trip, onDelete, onUpdateChecked, onUpdatetrip }) => {

  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(trip.text)
  const [open, setOpen] = useState(false);
  const isCompleted = !!trip.isCompleted

  const toYmd = (d) => new Date(d).toISOString().slice(0, 10)
  const pickDate = (t) => t?.date ?? t?.createdAt ?? new Date()

  const [dateStr, setDateStr] = useState(toYmd(pickDate(trip)))

  useEffect(() => {
    if (!editing) {
      setText(trip.text)
      setDateStr(toYmd(pickDate(trip)))
    }
  }, [trip, editing])

  const startEdit = () => {
    setText(trip.text)
    setDateStr(toYmd(pickDate(trip)))
    setEditing(true)
  }
  const cancleEdit = () => {
    setText(trip.text)
    setEditing(false)
  }
  const saveEdit = async () => {
    const next = text.trim()
    const prevYmd = toYmd(pickDate(trip))
    if (!next || next === trip.text && prevYmd === dateStr) {
      return setEditing(false)
    }

    const nextDateISO = new Date(`${dateStr}T00:00:00`).toISOString()



    await onUpdatetrip(trip._id, {
      text: next,
      date: nextDateISO
    })

    setEditing(false)
  }

  const handleKeyDown = () => {
    if (e.key == 'Enter') saveEdit()
    if (e.key == 'Escape') cancleEdit()
  }

  const displayDate = useMemo(() => {
    try {
      if (!trip?.date) return "";
      const d = new Date(trip.date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("ko-KR");
    } catch {
      return "";
    }
  }, [trip?.date]);


  return (
    <div className={`TripItem ${isCompleted ? 'isCompleted' : ''}`}>
      <input
        type="checkbox"
        checked={trip.isCompleted}
        onChange={() => onUpdateChecked(trip._id, !trip.isCompleted)}
        readOnly />
      {editing ? (<div className="edit-wrap">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='수정할 내용을 입력하세요'
        />

        <div className="date">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
          />
        </div>
        <div className="btn-wrap">
          <button className="updateBtn" onClick={saveEdit}>저장하기</button>
          <button className="deleteBtn"
            onClick={cancleEdit}
          >취소</button>
        </div>
      </div>
      ) : (
        <div className="content-wrap">

          <div className="content">{trip.name}</div>
          <div className="date">{new Date(`${trip.date}`).toLocaleDateString()}</div>
          <div className="btn-wrap">
            <button className="updateBtn" onClick={startEdit}>수정</button>
            <button className="deleteBtn"
              onClick={() => onDelete(trip._id)}
            >삭제</button>
          </div>
        </div>)}

        


    </div>
  )
}

export default TripItem