import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

/** Keep in sync with inline script in index.html (FOUC prevention). */
export const THEME_STORAGE_KEY = "fvm-app-theme";

const VALID = new Set(["light", "dark"]);

function readStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyDomTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const { user, token, setUser } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  const [theme, setThemeState] = useState(() => readStoredTheme());

  useEffect(() => {
    const t = user?.appTheme;
    if (t === "light" || t === "dark") {
      setThemeState(t);
    }
  }, [user?._id, user?.appTheme]);

  useEffect(() => {
    if (!token) {
      setThemeState(readStoredTheme());
    }
  }, [token]);

  useEffect(() => {
    applyDomTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const persistAppTheme = useCallback(
    (next) => {
      if (!token) return;
      axios
        .patch(
          `${backendUrl}/api/users/app-theme`,
          { appTheme: next },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .then((res) => {
          if (res.data?.user && typeof setUser === "function") {
            setUser(res.data.user);
          }
        })
        .catch(() => {});
    },
    [token, backendUrl, setUser],
  );

  const setTheme = useCallback(
    (next) => {
      setThemeState((prev) => {
        const v = typeof next === "function" ? next(prev) : next;
        if (!VALID.has(v)) return prev;
        queueMicrotask(() => persistAppTheme(v));
        return v;
      });
    },
    [persistAppTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      queueMicrotask(() => persistAppTheme(next));
      return next;
    });
  }, [persistAppTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
