import React, { useState, useRef } from "react";
import { extractMeetingData } from "../utils/api";
import ProcessingBox from "./ProcessingBox";

const TABS = ["Paste", "Upload", "Manual"];
const ACCEPT = ".txt,.md,.pdf,.csv,.rtf,text/plain,text/markdown,application/pdf";

// ── File readers ──────────────────────────────────────────────────────────────

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result || "");
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsText(file);
  });
}

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      } catch (e) { reject(e); }
    };
    script.onerror = () => reject(new Error("Could not load PDF library."));
    document.head.appendChild(script);
  });
}

async function extractPdfText(file) {
  const pdfjs = await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((x) => x.str).join(" ") + "\n";
  }
  return text.trim();
}

async function readFileText(file) {
  const name = (file.name || "").toLowerCase();
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return await extractPdfText(file);
  }

  // .doc/.docx — best effort text extraction
  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const raw = await readAsText(file);
    const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n").trim();
    if (cleaned.length > 80) return cleaned;
    throw new Error("Word file couldn't be read as text. Please paste the content in the Paste tab.");
  }

  // .txt, .md, .csv, .rtf, etc.
  return await readAsText(file);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddMeetingModal({ onClose, onAdd }) {
  const [tab,        setTab]        = useState(0);
  const [pasteText,  setPasteText]  = useState("");
  const [file,       setFile]       = useState(null);
  const [drag,       setDrag]       = useState(false);
  const [processing, setProcessing] = useState(false);
  const [steps,      setSteps]      = useState([]);
  const [error,      setError]      = useState("");

  const [manual, setManual] = useState({
    title: "", date: "", platform: "", attendees: "",
    summary: "", decisions: "", actions: "", tags: "",
  });

  const fileRef = useRef();

  function updateStep(label, status) {
    setSteps((prev) => {
      const exists = prev.find((s) => s.label === label);
      if (exists) return prev.map((s) => s.label === label ? { ...s, status } : s);
      return [...prev, { label, status }];
    });
  }

  function switchTab(i) {
    setTab(i);
    setError("");
    setProcessing(false);
    setSteps([]);
    setFile(null);
  }

  async function processText(raw, title = "") {
    if (!raw?.trim()) { setError("No content to process."); return; }
    setProcessing(true);
    setError("");
    setSteps([]);

    try {
      updateStep("Reading content", "done");
      updateStep("AI extracting meeting data…", "active");

      const data = await extractMeetingData(raw, title);
      if (!data) throw new Error("AI returned no data.");

      updateStep("AI extracting meeting data…", "done");
      updateStep("Saving meeting", "active");

      const meeting = {
        id:         Date.now().toString(),
        title:      data.title     || title || "Untitled Meeting",
        date:       data.date      || new Date().toISOString().split("T")[0],
        platform:   data.platform  || "Unknown",
        attendees:  data.attendees || [],
        summary:    data.summary   || "",
        decisions:  data.decisions || [],
        actions:    (data.actions  || []).map((a, i) => ({
          id:   i.toString(),
          text: typeof a === "string" ? a : (a.text || ""),
          done: false,
          due:  a.due || null,
        })),
        tags:       data.tags  || [],
        transcript: raw,
        pinned:     false,
        createdAt:  Date.now(),
      };

      updateStep("Saving meeting", "done");
      setTimeout(() => { onAdd(meeting); onClose(); }, 400);

    } catch (err) {
      console.error("Process error:", err);
      setError("AI processing failed. " + (err.message || "Try the manual form."));
      setProcessing(false);
    }
  }

  async function handleUpload(f) {
    if (!f) return;
    setFile(f);
    setError("");
    setSteps([]);
    setProcessing(true);

    try {
      updateStep("Reading file…", "active");
      const text = await readFileText(f);
      updateStep("Reading file…", "done");

      if (!text?.trim()) throw new Error("File appears empty or unreadable.");
      await processText(text, f.name.replace(/\.[^.]+$/, ""));

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Could not read file.");
      setProcessing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleUpload(f);
  }

  function handleManualSubmit() {
    const meeting = {
      id:         Date.now().toString(),
      title:      manual.title    || "Untitled Meeting",
      date:       manual.date     || new Date().toISOString().split("T")[0],
      platform:   manual.platform || "Unknown",
      attendees:  manual.attendees.split(",").map((s) => s.trim()).filter(Boolean),
      summary:    manual.summary,
      decisions:  manual.decisions.split("\n").filter(Boolean),
      actions:    manual.actions.split("\n").filter(Boolean).map((t, i) => ({
        id: i.toString(), text: t, done: false, due: null,
      })),
      tags:       manual.tags.split(",").map((s) => s.trim()).filter(Boolean),
      transcript: "",
      pinned:     false,
      createdAt:  Date.now(),
    };
    onAdd(meeting);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">

        <div className="modal-header">
          <span className="modal-title">Add Meeting</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`modal-tab${tab === i ? " active" : ""}`} onClick={() => switchTab(i)}>
              {t}
            </button>
          ))}
        </div>

        <div className="modal-body">

          {/* ── Paste ── */}
          {tab === 0 && (
            <>
              <div className="field">
                <label className="field-label">Paste transcript or meeting notes</label>
                <textarea
                  className="field-textarea"
                  style={{ minHeight: 180 }}
                  placeholder="Paste your meeting transcript or notes here…"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  disabled={processing}
                />
              </div>
              {error && <p style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{error}</p>}
              {processing && <ProcessingBox steps={steps} />}
            </>
          )}

          {/* ── Upload ── */}
          {tab === 1 && (
            <>
              <div
                className={`upload-zone${drag ? " drag" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => !processing && fileRef.current?.click()}
                style={{ cursor: processing ? "default" : "pointer" }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }}
                />
                <div className="upload-icon">📎</div>
                <div className="upload-title">
                  {processing ? "Processing file…" : "Drop a file or click to browse"}
                </div>
                <div className="upload-sub">Supports .txt · .md · .pdf · .csv · .rtf</div>
                {file && <div className="upload-file-name">📄 {file.name}</div>}
              </div>

              {error && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ color: "var(--danger)", fontSize: 12, marginBottom: 6 }}>{error}</p>
                  <p style={{ color: "var(--ink3)", fontSize: 11 }}>
                    Tip: Try copying the text and using the <strong>Paste</strong> tab instead.
                  </p>
                </div>
              )}
              {processing && <ProcessingBox steps={steps} />}
            </>
          )}

          {/* ── Manual ── */}
          {tab === 2 && (
            <>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Title</label>
                  <input className="field-input" placeholder="Sprint planning…" value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Date</label>
                  <input className="field-input" type="date" value={manual.date} onChange={(e) => setManual({ ...manual, date: e.target.value })} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Platform</label>
                  <input className="field-input" placeholder="Zoom, Google Meet…" value={manual.platform} onChange={(e) => setManual({ ...manual, platform: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Attendees</label>
                  <input className="field-input" placeholder="Alice, Bob, Carol" value={manual.attendees} onChange={(e) => setManual({ ...manual, attendees: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Summary</label>
                <textarea className="field-textarea" placeholder="Brief summary…" value={manual.summary} onChange={(e) => setManual({ ...manual, summary: e.target.value })} />
              </div>
              <div className="field">
                <label className="field-label">Decisions (one per line)</label>
                <textarea className="field-textarea" placeholder="We decided to ship v2 by April…" value={manual.decisions} onChange={(e) => setManual({ ...manual, decisions: e.target.value })} />
              </div>
              <div className="field">
                <label className="field-label">Action items (one per line)</label>
                <textarea className="field-textarea" placeholder="Alice: Fix login bug by Friday" value={manual.actions} onChange={(e) => setManual({ ...manual, actions: e.target.value })} />
              </div>
              <div className="field">
                <label className="field-label">Tags (comma-separated)</label>
                <input className="field-input" placeholder="engineering, sprint, backend" value={manual.tags} onChange={(e) => setManual({ ...manual, tags: e.target.value })} />
              </div>
            </>
          )}

        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {tab === 0 && (
            <button className="btn-primary" disabled={!pasteText.trim() || processing} onClick={() => processText(pasteText)}>
              {processing ? <><span className="spinner" /> Processing…</> : "Process with AI →"}
            </button>
          )}
          {tab === 2 && (
            <button className="btn-primary" disabled={!manual.title.trim()} onClick={handleManualSubmit}>
              Save Meeting
            </button>
          )}
        </div>

      </div>
    </div>
  );
}