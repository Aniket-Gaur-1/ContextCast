import React from "react";

import { useState } from "react";
import { generateShareText } from "../utils/helpers";

export default function ShareModal({ meeting, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = generateShareText(meeting);

  function copyToClipboard() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">Share Meeting Summary</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 11, color: "var(--ink3)", marginBottom: 12 }}>
            Copy this formatted summary to share via Slack, email, or any messaging app.
          </p>
          <div className="share-box">{text}</div>
          {copied && <div className="copy-success">✓ Copied to clipboard!</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={copyToClipboard}>📋 Copy Summary</button>
        </div>
      </div>
    </div>
  );
}
