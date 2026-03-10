import React from "react";

// A single meeting row rendered in the sidebar list


export default function MeetingRow({ meeting, isActive, onSelect }) {
  return (
    <div
      className={`meeting-item ${isActive ? "active" : ""} ${meeting.pinned ? "pinned-item" : ""}`}
      onClick={onSelect}
    >
      <div className="meet-header">
        <div className="meet-title">
          {meeting.pinned && <span className="meet-pin">📌 </span>}
          {meeting.title}
        </div>
        <div className="meet-platform">
          {meeting.platform === "Google Meet" ? "Meet" : meeting.platform}
        </div>
      </div>

      <div className="meet-meta">
        <span>{meeting.date}</span>
        <span>·</span>
        <span>{meeting.duration}</span>
        <span>·</span>
        <span>{meeting.attendees.length} people</span>
      </div>

      <div className="meet-summary">{meeting.summary}</div>

      <div className="meet-tags">
        {meeting.tags.map((tag) => (
          <span key={tag} className="meet-tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
