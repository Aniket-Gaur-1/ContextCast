import React from "react";

export default function ConfirmDelete({ meeting, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-icon">🗑</div>
        <div className="confirm-title">Delete this meeting?</div>
        <div className="confirm-sub">
          "{meeting.title}" will be permanently removed from your memory.
        </div>
        <div className="confirm-btns">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={() => onConfirm(meeting.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
