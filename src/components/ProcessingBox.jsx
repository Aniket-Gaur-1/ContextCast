import React from "react";

// Shows a step-by-step AI processing indicator inside the Add Meeting modal
export default function ProcessingBox({ steps, currentStep }) {
  return (
    <div className="processing-box">
      <div className="processing-title">
        <span className="ai-dot" style={{ background: "var(--accent)" }} />
        AI processing...
      </div>
      {steps.map((step, i) => (
        <div
          key={i}
          className={`processing-step ${
            i < currentStep ? "step-done" : i === currentStep ? "step-active" : "step-pending"
          }`}
        >
          <span>{i < currentStep ? "✓" : i === currentStep ? "▶" : "○"}</span>
          {step}
        </div>
      ))}
    </div>
  );
}
