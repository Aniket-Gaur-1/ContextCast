import React from "react";
import { useState, useRef } from "react";
import ProcessingBox from "./ProcessingBox";
import { extractMeetingData } from "../utils/api";

const PROC_STEPS = [
  "Parsing content...",
  "Extracting decisions...",
  "Identifying actions...",
  "Generating summary...",
  "Saving...",
];

export default function AddMeetingModal({ existing, onSave, onClose }) {
  const isEdit = !!existing;
  const [activeTab, setActiveTab] = useState(isEdit ? "form" : "paste");
  const [processing, setProcessing] = useState(false);
  const [procStep, setProcStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [uploadText, setUploadText] = useState("");
  const fileRef = useRef();

  const [form, setForm] = useState(
    existing
      ? {
          title: existing.title,
          date: existing.date,
          duration: existing.duration,
          platform: existing.platform,
          attendees: existing.attendees.filter((a) => a !== "You").join(", "),
          notes: existing.transcript || "",
          decisions: existing.decisions.join("\n"),
          actions: existing.actions.map((a) => a.text).join("\n"),
          tags: existing.tags.join(", "),
        }
      : {
          title: "",
          date: new Date().toISOString().slice(0, 10),
          duration: "",
          platform: "Google Meet",
          attendees: "",
          notes: "",
          decisions: "",
          actions: "",
          tags: "",
        }
  );

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function processWithAI(rawText, title = "") {
    setProcessing(true);
    setProcStep(0);
    const interval = setInterval(
      () => setProcStep((s) => Math.min(s + 1, PROC_STEPS.length - 1)),
      700
    );
    try {
      const parsed = await extractMeetingData(rawText, title);
      clearInterval(interval);
      if (parsed) {
        onSave({
          id: Date.now(),
          pinned: false,
          transcript: rawText,
          title: parsed.title || title || "Untitled",
          date: new Date().toISOString().slice(0, 10),
          duration: "—",
          platform: "Manual",
          attendees: ["You", ...(parsed.attendees || []).filter((a) => a !== "You")],
          summary: parsed.summary || "",
          decisions: parsed.decisions || [],
          actions: (parsed.actions || []).map((a) => ({ text: a, done: false, due: null })),
          tags: parsed.tags || [],
        });
      }
    } catch {
      clearInterval(interval);
      alert("AI processing failed. Try the manual form.");
    }
    setProcessing(false);
  }

  function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setUploadText(e.target.result);
    reader.readAsText(file);
  }

  function submitForm() {
    onSave({
      id: existing?.id || Date.now(),
      pinned: existing?.pinned || false,
      title: form.title || "Untitled",
      date: form.date,
      duration: form.duration || "—",
      platform: form.platform,
      attendees: ["You", ...form.attendees.split(",").map((s) => s.trim()).filter(Boolean)],
      transcript: form.notes,
      summary: form.notes.slice(0, 130) + (form.notes.length > 130 ? "…" : ""),
      decisions: form.decisions.split("\n").map((s) => s.trim()).filter(Boolean),
      actions: form.actions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((t) => ({ text: t, done: false, due: null })),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Meeting" : "Add Meeting"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!isEdit && (
          <div className="modal-tabs">
            {[["paste", "Paste"], ["upload", "Upload"], ["form", "Manual"]].map(([id, label]) => (
              <button
                key={id}
                className={`modal-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="modal-body">
          {/* PASTE TAB */}
          {activeTab === "paste" && !isEdit && (
            <div>
              <div className="field">
                <label className="field-label">Paste transcript or notes</label>
                <textarea
                  className="field-textarea"
                  style={{ minHeight: 190 }}
                  placeholder={"Sarah: We should discuss...\nYou: I think we need to...\n\nPaste any meeting notes or transcript."}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                />
                <div className="field-hint">
                  AI will extract decisions, actions, and generate a summary automatically.
                </div>
              </div>
              {processing && <ProcessingBox steps={PROC_STEPS} currentStep={procStep} />}
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === "upload" && !isEdit && (
            <div>
              <div
                className={`upload-zone ${dragOver ? "drag" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              >
                <div className="upload-icon">📄</div>
                <div className="upload-title">Drop file or click to upload</div>
                <div className="upload-sub">.txt or .md files</div>
                {fileName && <div className="upload-file-name">✓ {fileName}</div>}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {uploadText && (
                <div className="field" style={{ marginTop: 14 }}>
                  <label className="field-label">Preview</label>
                  <textarea
                    className="field-textarea"
                    style={{ minHeight: 110 }}
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                  />
                </div>
              )}
              {processing && <ProcessingBox steps={PROC_STEPS} currentStep={procStep} />}
            </div>
          )}

          {/* MANUAL FORM TAB */}
          {(activeTab === "form" || isEdit) && (
            <div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Title *</label>
                  <input className="field-input" placeholder="Q2 Planning" value={form.title} onChange={setField("title")} />
                </div>
                <div className="field">
                  <label className="field-label">Date</label>
                  <input type="date" className="field-input" value={form.date} onChange={setField("date")} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Duration</label>
                  <input className="field-input" placeholder="45 min" value={form.duration} onChange={setField("duration")} />
                </div>
                <div className="field">
                  <label className="field-label">Platform</label>
                  <select className="field-select" value={form.platform} onChange={setField("platform")}>
                    <option>Google Meet</option>
                    <option>Zoom</option>
                    <option>Teams</option>
                    <option>In Person</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Attendees (comma separated)</label>
                <input className="field-input" placeholder="Sarah K., James L." value={form.attendees} onChange={setField("attendees")} />
              </div>
              <div className="field">
                <label className="field-label">Notes / Transcript</label>
                <textarea className="field-textarea" placeholder="What was discussed..." value={form.notes} onChange={setField("notes")} />
              </div>
              <div className="field">
                <label className="field-label">Decisions (one per line)</label>
                <textarea className="field-textarea" style={{ minHeight: 72 }} placeholder="Migrate to GraphQL" value={form.decisions} onChange={setField("decisions")} />
              </div>
              <div className="field">
                <label className="field-label">Action Items (one per line)</label>
                <textarea className="field-textarea" style={{ minHeight: 72 }} placeholder="James: Schema draft by Friday" value={form.actions} onChange={setField("actions")} />
              </div>
              <div className="field">
                <label className="field-label">Tags (comma separated)</label>
                <input className="field-input" placeholder="engineering, api" value={form.tags} onChange={setField("tags")} />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {activeTab === "paste" && !isEdit && (
            <button className="btn-primary" disabled={!pasteText.trim() || processing} onClick={() => processWithAI(pasteText)}>
              {processing ? <><span className="spinner" /> Processing...</> : "Analyze & Save"}
            </button>
          )}
          {activeTab === "upload" && !isEdit && (
            <button className="btn-primary" disabled={!uploadText.trim() || processing} onClick={() => processWithAI(uploadText, fileName.replace(/\.[^.]+$/, ""))}>
              {processing ? <><span className="spinner" /> Processing...</> : "Analyze & Save"}
            </button>
          )}
          {(activeTab === "form" || isEdit) && (
            <button className="btn-primary" disabled={!form.title.trim()} onClick={submitForm}>
              {isEdit ? "Save Changes" : "Save Meeting"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
