import React from "react";
import { useState, useEffect } from "react";

// Data
import { DEMO_MEETINGS } from "./data/demo";

// Hooks
import { useStorage, useSearch } from "./hooks/index";

// Components
import Sidebar from "./components/Sidebar";
import MeetingDetail from "./components/MeetingDetail";
import SearchResults from "./components/SearchResults";
import AddMeetingModal from "./components/AddMeetingModal";
import ShareModal from "./components/ShareModal";
import ConfirmDelete from "./components/ConfirmDelete";

// Pages
import Insights from "./pages/Insights";

export default function App() {
  // Persisted state
  const [meetings, setMeetings] = useStorage("cc_meetings", DEMO_MEETINGS);
  const [dark, setDark] = useStorage("cc_dark", false);

useEffect(() => {
  document.body.classList.toggle("dark", dark);
}, [dark]);

  // UI state
  const [tab, setTab] = useState("memory");
  const [selected, setSelected] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [filterPerson, setFilterPerson] = useState(null);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);

  // Search
  const { query, setQuery, results, aiAnswer, aiLoading } = useSearch(meetings);

  // Derived data for filters
  const allTags = [...new Set(meetings.flatMap((m) => m.tags))];
  const allPeople = [...new Set(meetings.flatMap((m) => m.attendees).filter((a) => a !== "You"))];
  const overdueCount = meetings.flatMap((m) =>
    m.actions.filter((a) => !a.done && new Date(a.due) < new Date())
  ).length;

  // Filtered meeting list for sidebar
  function getFilteredMeetings() {
    let list = meetings;
    if (filterTag) list = list.filter((m) => m.tags.includes(filterTag));
    if (filterPerson) list = list.filter((m) => m.attendees.includes(filterPerson));
    return list;
  }

  // ── Meeting mutations ──────────────────────────────────────────────────────

  function addMeeting(meeting) {
    setMeetings((prev) => [meeting, ...prev]);
    setShowAdd(false);
    setSelected(meeting);
  }

  function updateMeeting(meeting) {
    setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? meeting : m)));
    setEditTarget(null);
    setSelected(meeting);
  }

  function deleteMeeting(id) {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteTarget(null);
  }

  function togglePin(id) {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
    if (selected?.id === id) setSelected((s) => ({ ...s, pinned: !s.pinned }));
  }

  function toggleAction(meetingId, actionIndex) {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const actions = m.actions.map((a, i) =>
          i === actionIndex ? { ...a, done: !a.done } : a
        );
        return { ...m, actions };
      })
    );
    if (selected?.id === meetingId) {
      setSelected((s) => ({
        ...s,
        actions: s.actions.map((a, i) =>
          i === actionIndex ? { ...a, done: !a.done } : a
        ),
      }));
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-left">
          <div className="logo-wrap">
            <div className="logo-icon">C</div>
            <div className="logo-name">
              Context<span>Cast</span>
            </div>
          </div>
          <div className="nav-tabs">
            {["memory", "insights"].map((t) => (
              <button
                key={t}
                className={`nav-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-stat">
            <div className="nav-stat-num">{meetings.length}</div>
            <div className="nav-stat-label">Meetings</div>
          </div>
          <div className="vdivider" />
          <div className="nav-stat">
            <div className="nav-stat-num" style={{ color: overdueCount > 0 ? "#e04040" : undefined }}>
              {overdueCount}
            </div>
            <div className="nav-stat-label" style={{ color: overdueCount > 0 ? "#e04040" : undefined }}>
              Overdue
            </div>
          </div>
          <div className="vdivider" />
          <button className="icon-btn" onClick={() => setDark((d) => !d)} title="Toggle dark mode">
            {dark ? "☀️" : "🌙"}
          </button>
          <button className="add-btn" onClick={() => setShowAdd(true)}>
            + Add Meeting
          </button>
        </div>
      </nav>

      {/* MEMORY TAB */}
      {tab === "memory" && (
        <div className="layout">
          <Sidebar
            meetings={getFilteredMeetings()}
            selected={selected}
            onSelect={(m) => { setSelected(m); setQuery(""); }}
            query={query}
            setQuery={setQuery}
            searchResults={results}
            filterTag={filterTag}
            filterPerson={filterPerson}
            allTags={allTags}
            allPeople={allPeople}
            onFilterTag={setFilterTag}
            onFilterPerson={setFilterPerson}
          />

          <main className="main-panel">
            {query.trim() && results !== null ? (
              <SearchResults
                query={query}
                results={results}
                aiAnswer={aiAnswer}
                aiLoading={aiLoading}
                onOpen={(m) => { setSelected(m); setQuery(""); }}
              />
            ) : selected ? (
              <MeetingDetail
                meeting={selected}
                onPin={togglePin}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onShare={setShareTarget}
                onToggleAction={toggleAction}
              />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⌕</div>
                <div className="empty-title">Your meeting memory</div>
                <div className="empty-sub">
                  Select a meeting, search with natural language, or filter by tag and person.
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
                  {["OAuth decision", "Slack integration", "security findings", "Q2 priorities"].map((q) => (
                    <button key={q} className="chip-btn" onClick={() => setQuery(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* INSIGHTS TAB */}
      {tab === "insights" && <Insights meetings={meetings} />}

      {/* MODALS */}
      {showAdd && <AddMeetingModal onAdd={addMeeting} onClose={() => setShowAdd(false)} />}
      {editTarget && <AddMeetingModal existing={editTarget} onAdd={updateMeeting} onClose={() => setEditTarget(null)} />}
      {deleteTarget && <ConfirmDelete meeting={deleteTarget} onConfirm={deleteMeeting} onCancel={() => setDeleteTarget(null)} />}
      {shareTarget && <ShareModal meeting={shareTarget} onClose={() => setShareTarget(null)} />}
    </div>
  );
}
