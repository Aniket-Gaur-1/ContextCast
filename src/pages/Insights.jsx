import { isOverdue, avatarInitials } from "../utils/helpers";

export default function Insights({ meetings }) {
  const allPeople = [...new Set(meetings.flatMap((m) => m.attendees).filter((a) => a !== "You"))];

  const overdueActions = meetings.flatMap((m) =>
    m.actions
      .filter((a) => !a.done && isOverdue(a.due))
      .map((a) => ({ ...a, meeting: m.title }))
  );

  const personStats = allPeople
    .map((person) => {
      const attended = meetings.filter((m) => m.attendees.includes(person));
      const actions = meetings.flatMap((m) =>
        m.actions.filter((a) => a.text.startsWith(person))
      );
      return {
        name: person,
        meetings: attended.length,
        actions: actions.length,
        done: actions.filter((a) => a.done).length,
      };
    })
    .sort((a, b) => b.meetings - a.meetings)
    .slice(0, 6);

  return (
    <div className="insights-wrap">
      <div className="detail-eyebrow" style={{ marginBottom: 18 }}>Overview</div>
      <div className="detail-title" style={{ marginBottom: 26 }}>Meeting Intelligence</div>

      {/* Summary stats */}
      <div className="insight-grid">
        {[
          { n: meetings.length, l: "Total Meetings", s: "In your memory" },
          { n: meetings.reduce((a, m) => a + m.decisions.length, 0), l: "Decisions Logged", s: "Across all meetings" },
          { n: meetings.reduce((a, m) => a + m.actions.length, 0), l: "Action Items", s: "Total assigned" },
          { n: overdueActions.length, l: "Overdue Actions", s: "Need attention", warn: overdueActions.length > 0 },
        ].map((card, i) => (
          <div key={i} className="insight-card">
            <div className="insight-num" style={card.warn && card.n > 0 ? { color: "#e04040" } : {}}>
              {card.n}
            </div>
            <div className="insight-label">{card.l}</div>
            <div className="insight-sub">{card.s}</div>
          </div>
        ))}
      </div>

      {/* Overdue actions */}
      {overdueActions.length > 0 && (
        <>
          <div className="sec-div" style={{ marginTop: 0 }}>⚠ Overdue Actions</div>
          <div className="overdue-section">
            <div className="overdue-head">
              ⚠ {overdueActions.length} overdue action{overdueActions.length > 1 ? "s" : ""}
            </div>
            {overdueActions.map((a, i) => (
              <div key={i} className="overdue-row">
                <div className="overdue-text">{a.text}</div>
                <div className="overdue-meeting">{a.meeting}</div>
                <div className="overdue-date">Due {a.due}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* People stats */}
      {personStats.length > 0 && (
        <>
          <div className="sec-div">People Stats</div>
          <div className="person-grid">
            {personStats.map((p, i) => (
              <div key={i} className="person-card">
                <div className="person-name">
                  <div className="person-avatar">{avatarInitials(p.name)}</div>
                  {p.name}
                </div>
                {[
                  { l: "Meetings attended", v: p.meetings },
                  { l: "Action items", v: p.actions },
                  { l: "Actions completed", v: `${p.done}/${p.actions}` },
                ].map((stat, j) => (
                  <div key={j} className="person-stat">
                    <span className="person-stat-label">{stat.l}</span>
                    <span className="person-stat-val">{stat.v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* All decisions */}
      <div className="sec-div">All Decisions</div>
      <div className="decisions-table">
        {meetings
          .flatMap((m) => m.decisions.map((d) => ({ meeting: m.title, date: m.date, decision: d })))
          .map((row, i) => (
            <div key={i} className="dt-row">
              <div className="dt-meeting">{row.meeting}</div>
              <div className="dt-decision">{row.decision}</div>
              <div className="dt-date">{row.date}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
