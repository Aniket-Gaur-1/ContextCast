import React from "react";

export default function ProcessingBox({ steps = [] }) {
  return (
    <div className="processing-box">
      <div className="processing-title">
        <span>⚙</span> Processing
      </div>
      {steps.map((step, i) => (
        <div key={i} className="processing-step">
          <span>
            {step.status === "done"   && "✓"}
            {step.status === "active" && "◌"}
            {step.status === "pending" && "·"}
          </span>
          <span className={`step-${step.status}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}