import { useState, useEffect } from "react";
import { askAboutMeetings } from "../utils/api";

// Persist state to localStorage
export function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

// Debounced AI-powered meeting search
export function useSearch(meetings, delay = 500) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setAiAnswer("");
      return;
    }

    const timer = setTimeout(async () => {
      // 1. Keyword filter (instant)
      const lower = query.toLowerCase();
      const matched = meetings.filter((m) =>
        [m.title, m.summary, m.transcript, ...m.decisions, ...m.actions.map((a) => a.text), ...m.tags, ...m.attendees]
          .join(" ")
          .toLowerCase()
          .includes(lower)
      );
      setResults(matched);

      // 2. AI semantic answer (async)
      setAiLoading(true);
      setAiAnswer("");
      try {
        const answer = await askAboutMeetings(query, meetings);
        setAiAnswer(answer);
      } catch {
        setAiAnswer("Keyword results shown below.");
      }
      setAiLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, meetings, delay]);

  return { query, setQuery, results, aiAnswer, aiLoading };
}
