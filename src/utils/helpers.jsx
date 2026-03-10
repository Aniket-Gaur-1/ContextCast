// Check if a due date is in the past
export function isOverdue(due) {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

// Get initials from a full name e.g. "Sarah K." → "SK"
export function avatarInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Generate a shareable plain-text summary of a meeting
export function generateShareText(meeting) {
  return `📋 ${meeting.title} — ${meeting.date}

${meeting.summary}

✅ Decisions:
${meeting.decisions.map((d) => `• ${d}`).join("\n")}

→ Actions:
${meeting.actions.map((a) => `• ${a.text}`).join("\n")}`;
}

// Highlight a keyword inside a transcript line, returns HTML string
export function getExcerpt(meeting, query) {
  const lower = query.toLowerCase();
  const line =
    meeting.transcript.split("\n").find((l) => l.toLowerCase().includes(lower)) ||
    meeting.summary;
  const i = line.toLowerCase().indexOf(lower);
  if (i === -1) return meeting.summary;
  return (
    `...${line.slice(Math.max(0, i - 40), i)}` +
    `<mark>${line.slice(i, i + lower.length)}</mark>` +
    `${line.slice(i + lower.length, i + lower.length + 80)}...`
  );
}

// Parse an excerpt HTML string into React elements
export function parseExcerpt(html) {
  return html.split(/(<mark>.*?<\/mark>)/g).map((part, i) =>
    part.startsWith("<mark>") ? (
      <mark key={i}>{part.replace(/<\/?mark>/g, "")}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
