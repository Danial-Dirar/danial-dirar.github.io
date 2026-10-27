"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/components/theme/theme-script";

type Theme = "dark" | "light";

const THEME_EVENT = "themechange";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** `themechange` covers toggles in this tab; `storage` covers other tabs. */
function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    commit(e.newValue === "light" ? "light" : "dark", false);
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Unknown until the client has read <html>; `null` keeps SSR markup neutral. */
const serverSnapshot = () => null;

function commit(next: Theme, persist = true) {
  const el = document.documentElement;
  el.classList.toggle("dark", next === "dark");
  el.style.colorScheme = next;
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage blocked: the theme still applies for this visit */
    }
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * Minimal theme hook — reads/writes the `.dark` class on <html> directly.
 * The blocking script lives in the server layout, so nothing is injected here.
 *
 * Passing an `origin` (the toggle's centre) grows the new theme out of that
 * point with a view transition, where the browser supports it and the visitor
 * has not asked for reduced motion.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverSnapshot);

  const apply = useCallback((next: Theme, origin?: { x: number; y: number }) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!origin || reduce || typeof document.startViewTransition !== "function") {
      commit(next);
      return;
    }

    const el = document.documentElement;
    el.classList.add("theme-sweep");
    const transition = document.startViewTransition(() => commit(next));
    transition.ready
      .then(() => {
        const { x, y } = origin;
        const r = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );
        el.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          {
            duration: 650,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        /* transition skipped — the theme is already committed */
      });
    transition.finished.finally(() => el.classList.remove("theme-sweep"));
  }, []);

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      apply(currentTheme() === "dark" ? "light" : "dark", origin);
    },
    [apply],
  );

  return { theme, setTheme: apply, toggle, mounted: theme !== null };
}
