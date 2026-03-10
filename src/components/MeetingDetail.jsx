import React from "react";
import { useState } from "react";
import { isOverdue } from "../utils/helpers";

export default function MeetingDetail({
  meeting,
  onPin,
  onEdit,
  onDelete,
  onShare,
  onToggleAction,
}) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  function exportPDF() {
    window.print();
  }

  return (
    <div className="detail">
      {/* Toolbar */}
      <div className="detail-toolbar">
        <button
          className={`tb-btn ${meeting.pinned ? "pinned" : ""}`}
          onClick={() => onPin(meeting.id)}
        >
          {meeting.pinned ? "📌 Pinned" : "📌 Pin"}
        </button>
        <button className="tb-btn" onClick={() => onEdit(meeting)}>✏️ Edit</button>
        <button className="tb-btn" onClick={() => onShare(meeting)}>🔗 Share</button>
        <button className="tb-btn" onClick={exportPDF}>⬇️ Export PDF</button>
        <div className="tb-spacer" />
        <button className="tb-btn danger" onClick={() => onDelete(meeting)}>🗑 Delete</button>
      </div>

      {/* Header */}
      <div className="detail-eyebrow">
        {meeting.platform} · {meeting.date}
      </div>
      <div className="detail-title">{meeting.title}</div>
      <div className="detail-meta">
        <div className="meta-chip">⏱ {meeting.duration}</div>
        <div className="meta-chip">👥 {meeting.attendees.join(", ")}</div>
      </div>

      {/* Summary */}
      <div className="sec-div">Summary</div>
      <div className="summary-box">{meeting.summary}</div>

      {/* Decisions + Actions */}
      <div className="sec-div">Decisions & Actions</div>
      <div className="two-col">
        {/* Decisions */}
        <div className="list-card">
          <div className="list-card-head">◆ Decisions</div>
          <div className="list-card-body">
            {meeting.decisions.map((d, i) => (
              <div key={i} className="list-item">
                <span className="list-bullet">◆</span>
                <span style={{ fontSize: 11, color: "var(--ink2)", lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="list-card">
          <div className="list-card-head">→ Action Items</div>
          <div className="list-card-body">
            {meeting.actions.map((action, i) => (
              <div key={i} className="action-item">
                <div
                  className={`action-check ${action.done ? "done" : ""}`}
                  onClick={() => onToggleAction(meeting.id, i)}
                >
                  {action.done && (
                    <span style={{ fontSize: 8, color: "#fff" }}>✓</span>
                  )}
                </div>
                <span className={`action-text ${action.done ? "done" : ""}`}>
                  {action.text}
                </span>
                {action.due && (
                  <span
                    className={`action-due ${
                      !action.done && isOverdue(action.due) ? "overdue" : ""
                    }`}
                  >
                    {action.due}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript */}
      {meeting.transcript && (
        <>
          <div className="sec-div">Transcript</div>
          <div className="transcript-box">
            <button
              className="transcript-toggle"
              onClick={() => setTranscriptOpen((o) => !o)}
            >
              <span>View transcript</span>
              <span className={`t-arrow ${transcriptOpen ? "open" : ""}`}>▾</span>
            </button>
            {transcriptOpen && (
              <div className="transcript-content">
                {meeting.transcript
                  .split("\n")
                  .filter(Boolean)
                  .map((line, i) => {
                    const colonIdx = line.indexOf(":");
                    if (colonIdx === -1)
                      return (
                        <div key={i} className="t-line">
                          <span className="utterance">{line}</span>
                        </div>
                      );
                    const speaker = line.slice(0, colonIdx);
                    const text = line.slice(colonIdx + 1).trim();
                    return (
                      <div key={i} className="t-line">
                        <span className={`speaker ${speaker === "You" ? "you" : ""}`}>
                          {speaker}
                        </span>
                        <span className="utterance">{text}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
