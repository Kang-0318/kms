import React, { useEffect, useState } from "react";
import "./EditModal.css"; // CSS는 아래 참고

const EditModal = ({ open, initialText, onClose, onSave }) => {
    const [text, setText] = useState(initialText || "");

    useEffect(() => {
        if (open) setText(initialText || "");
    }, [open, initialText]);

    if (!open) return null; // 열리지 않았으면 렌더링 안함

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>할 일 수정 ✏️</h3>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="modal-actions">
                    <button onClick={onClose}>취소</button>
                    <button
                        onClick={() => {
                            if (text.trim()) onSave(text.trim());
                        }}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
