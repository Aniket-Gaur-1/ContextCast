const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

async function callGemini(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  throw new Error("Rate limited after retries");
}

export async function askAboutMeetings(query, meetings) {
  const context = meetings.map(m =>
    `Meeting: "${m.title}" on ${m.date}\nSummary: ${m.summary}\nDecisions: ${m.decisions.join("; ")}\nActions: ${m.actions.map(a => a.text).join("; ")}`
  ).join("\n\n");

  return await callGemini(
    `You are a meeting memory assistant. Answer based ONLY on these notes, in 2-3 sentences.\n\nNotes:\n${context}\n\nQuestion: ${query}`
  );
}

export async function extractMeetingData(rawText, title = "") {
  const text = await callGemini(
    `Extract from this meeting. Return ONLY JSON, no markdown:\n{\n  "title": "${title || "infer from content"}",\n  "summary": "2 sentence summary",\n  "decisions": ["..."],\n  "actions": ["Person: action"],\n  "tags": ["tag1","tag2"],\n  "attendees": ["name1","name2"]\n}\n\nContent:\n${rawText}`
  );

  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1) return null;
  return JSON.parse(clean.slice(start, end + 1));
}