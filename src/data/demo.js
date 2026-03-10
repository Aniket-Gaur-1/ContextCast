export const DEMO_MEETINGS = [
  {
    id: 1,
    pinned: true,
    title: "API Redesign Planning",
    date: "2025-03-04",
    duration: "47 min",
    platform: "Google Meet",
    attendees: ["You", "Sarah K.", "James L.", "Priya M."],
    transcript:
      "Sarah: The main issue with the current REST API is versioning. We're on v1 and v2 simultaneously.\nJames: I think we should move to GraphQL for the new dashboard.\nYou: What about backward compatibility? We have external clients on v1.\nPriya: We decided last quarter to deprecate v1 by June.\nSarah: Decision — migrate to GraphQL for all new endpoints, deprecate v1 by June 15th.\nJames: I'll have a GraphQL schema draft ready by end of next week.\nPriya: The auth flow also needs to move to OAuth 2.0. Currently API keys are a security risk.\nYou: I'll open a rate limiting ticket.",
    summary: "Migrate to GraphQL, deprecate REST v1 by June 15, move auth to OAuth 2.0.",
    decisions: [
      "Migrate to GraphQL for all new endpoints",
      "Deprecate REST v1 by June 15th",
      "Move auth to OAuth 2.0",
    ],
    actions: [
      { text: "James: GraphQL schema draft by March 11", done: false, due: "2025-03-11" },
      { text: "You: Open rate limiting ticket", done: true, due: "2025-03-06" },
      { text: "Priya: Send deprecation notice to v1 clients", done: false, due: "2025-03-15" },
    ],
    tags: ["engineering", "api", "architecture"],
  },
  {
    id: 2,
    pinned: false,
    title: "Q1 Product Roadmap Review",
    date: "2025-02-28",
    duration: "62 min",
    platform: "Zoom",
    attendees: ["You", "Alex R.", "Nina T.", "Dev S.", "Maria C."],
    transcript:
      "Alex: Mobile app hit 10k downloads, dashboard v2 is live.\nNina: Retention is at 23% after day 7 — below our 35% target.\nDev: 60% of exit surveys say onboarding is confusing.\nAlex: Q2 priority — Slack integration is #1, onboarding redesign #2. AI recs pushed to Q3.\nYou: Agreed. Slack was our most requested feature.\nAlex: One backend engineer hire approved. Posting JD this week.",
    summary:
      "Q2 priorities: Slack integration #1, onboarding redesign #2. AI recs pushed to Q3. One hire approved.",
    decisions: [
      "Slack integration is Q2 priority #1",
      "AI recommendations pushed to Q3",
      "One backend engineer hire approved",
    ],
    actions: [
      { text: "Maria: Ship onboarding redesign by end of April", done: false, due: "2025-04-30" },
      { text: "Alex: Post backend engineer JD this week", done: true, due: "2025-03-07" },
      { text: "Dev: Define Slack integration scope", done: false, due: "2025-03-14" },
    ],
    tags: ["product", "roadmap", "q2"],
  },
  {
    id: 3,
    pinned: false,
    title: "Security Audit Debrief",
    date: "2025-02-20",
    duration: "35 min",
    platform: "Google Meet",
    attendees: ["You", "Ravi N.", "Sarah K."],
    transcript:
      "Ravi: Three critical findings: PII in logs, no MFA on admin panel, unencrypted staging DB.\nYou: PII logging — is that a one-line fix?\nRavi: Yes. I'll push it today.\nSarah: I'll call legal tomorrow about notification obligations.\nYou: Priority order: PII fix today, MFA week 1, encryption week 2.",
    summary:
      "3 critical security findings. Fix priority: PII logging (today), MFA on admin (week 1), DB encryption (week 2).",
    decisions: [
      "Fix PII logging immediately",
      "MFA on admin panel by week 1",
      "Encryption at rest by week 2",
    ],
    actions: [
      { text: "Ravi: Push PII logging fix today", done: true, due: "2025-02-20" },
      { text: "Sarah: Call with legal re: notification", done: true, due: "2025-02-21" },
      { text: "You: Review full audit report", done: false, due: "2025-03-01" },
    ],
    tags: ["security", "compliance", "urgent"],
  },
];
