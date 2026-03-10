import React ,{ useRef } from "react";
import MeetingRow from "./MeetingRow";

export default function Sidebar({
  meetings,
  selected,
  onSelect,
  query,
  setQuery,
  searchResults,
  filterTag,
  filterPerson,
  allTags,
  allPeople,
  onFilterTag,
  onFilterPerson,
}) {
  const inputRef = useRef();

  const pinnedMeetings = meetings.filter((m) => m.pinned);
  const unpinnedMeetings = meetings.filter((m) => !m.pinned);
  const displayList = query.trim() && searchResults !== null ? searchResults : meetings;

  return (
    <aside className="sidebar">
      {/* Search */}
      <div className="search-wrap">
        <div className="search-box">
          <span style={{ fontSize: 12, color: "var(--ink3)" }}>⌕</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Ask anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <span
              onClick={() => setQuery("")}
              style={{ cursor: "pointer", fontSize: 11, color: "var(--ink3)" }}
            >
              ✕
            </span>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-bar">
        <button
          className={`filter-chip ${!filterTag && !filterPerson ? "active" : ""}`}
          onClick={() => { onFilterTag(null); onFilterPerson(null); }}
        >
          All
        </button>
        {allTags.slice(0, 4).map((tag) => (
          <button
            key={tag}
            className={`filter-chip ${filterTag === tag ? "active" : ""}`}
            onClick={() => onFilterTag(filterTag === tag ? null : tag)}
          >
            {tag}
          </button>
        ))}
        {allPeople.slice(0, 2).map((person) => (
          <button
            key={person}
            className={`filter-chip person ${filterPerson === person ? "active" : ""}`}
            onClick={() => onFilterPerson(filterPerson === person ? null : person)}
          >
            {person.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="sidebar-status">
        <span>
          {displayList.length} meeting{displayList.length !== 1 ? "s" : ""}
        </span>
        <div className="ai-badge">
          <div className="ai-dot" />
          AI
        </div>
      </div>

      {/* Meeting list */}
      <div className="meetings-list">
        {meetings.length === 0 ? (
          <div className="no-meetings">
            No meetings yet.
            <br />
            Click <strong>"+ Add Meeting"</strong> to start.
          </div>
        ) : query.trim() && searchResults !== null ? (
          displayList.map((m) => (
            <MeetingRow
              key={m.id}
              meeting={m}
              isActive={selected?.id === m.id}
              onSelect={() => onSelect(m)}
            />
          ))
        ) : (
          <>
            {pinnedMeetings.length > 0 && (
              <>
                <div className="pinned-header">📌 Pinned</div>
                {pinnedMeetings.map((m) => (
                  <MeetingRow
                    key={m.id}
                    meeting={m}
                    isActive={selected?.id === m.id}
                    onSelect={() => onSelect(m)}
                  />
                ))}
              </>
            )}
            {unpinnedMeetings.map((m) => (
              <MeetingRow
                key={m.id}
                meeting={m}
                isActive={selected?.id === m.id}
                onSelect={() => onSelect(m)}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
