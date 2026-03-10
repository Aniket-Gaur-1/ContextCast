import React from "react";

import { getExcerpt, parseExcerpt } from "../utils/helpers";

export default function SearchResults({ query, results, aiAnswer, aiLoading, onOpen }) {
  return (
    <div className="search-results-panel">
      <div className="search-query-label">
        Results for <span>"{query}"</span>
      </div>
      <div className="search-count">{results.length} meetings matched</div>

      {/* AI Answer box */}
      <div className="ai-answer">
        <div className="ai-answer-head">
          <div className="ai-dot" style={{ background: "var(--accent)" }} />
          <div className="ai-answer-label">AI Answer</div>
        </div>
        {aiLoading ? (
          <div className="ai-thinking">
            Thinking
            <span className="thinking-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        ) : (
          <div className="ai-answer-text">{aiAnswer}</div>
        )}
      </div>

      {/* Result cards */}
      {results.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--ink3)", fontSize: 13 }}>
          No meetings matched.
        </div>
      ) : (
        results.map((meeting) => (
          <div
            key={meeting.id}
            className="result-card"
            onClick={() => onOpen(meeting)}
          >
            <div className="result-card-head">
              <div className="result-title">{meeting.title}</div>
              <div className="result-date">{meeting.date}</div>
            </div>
            <div className="result-excerpt">
              {parseExcerpt(getExcerpt(meeting, query))}
            </div>
            <div className="result-footer">
              {meeting.tags.map((tag) => (
                <span key={tag} className="result-tag">{tag}</span>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--ink3)" }}>
                Open →
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
