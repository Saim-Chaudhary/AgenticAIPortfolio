"use client";
import { useEffect, useState } from "react";

const META: Record<string, string> = { dark: "#1a0c0f", light: "#f1f3f6" };

/* Applies a theme to the document: attribute, color-scheme and theme-color meta. The head script does the same before first paint. */
function apply(theme: "dark" | "light") {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", META[theme]));
  document.querySelectorAll('meta[name="color-scheme"]').forEach((m) => m.setAttribute("content", theme));
}

function Sun() {
  return (
    <svg className="ts-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
      </g>
    </svg>
  );
}
function Moon() {
  return (
    <svg className="ts-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    const root = document.documentElement;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("theme-anim");
      window.setTimeout(() => root.classList.remove("theme-anim"), 260);
    }
    apply(next);
    setDark(next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage can be blocked; the choice then lasts for this visit only */
    }
  };
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Dark mode" className="theme-switch" onClick={flip}>
      <span className="ts-thumb" aria-hidden="true" />
      <span className="ts-opt ts-light">
        <Sun />
        <span className="ts-lab">Light</span>
      </span>
      <span className="ts-opt ts-dark">
        <Moon />
        <span className="ts-lab">Dark</span>
      </span>
    </button>
  );
}
