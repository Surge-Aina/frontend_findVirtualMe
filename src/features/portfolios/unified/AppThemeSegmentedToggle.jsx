import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/context/ThemeContext";

/**
 * Two-segment Light / Dark control with a sliding pill (respects prefers-reduced-motion).
 */
export default function AppThemeSegmentedToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Appearance</p>
      <div
        className="relative flex h-10 w-full rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-neutral-600 dark:bg-neutral-800"
        role="group"
        aria-label="Color theme"
      >
        <div
          className="pointer-events-none absolute top-1 bottom-1 w-[calc(50%-0.375rem)] rounded-md border border-gray-200/80 bg-white shadow-sm dark:border-neutral-500/50 dark:bg-neutral-700 motion-safe:transition-[left] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
          style={{ left: isDark ? "calc(50% + 0.125rem)" : "0.25rem" }}
          aria-hidden
        />
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={!isDark}
          aria-label="Light theme"
          className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium motion-safe:transition-colors ${
            !isDark
              ? "text-gray-900 dark:text-neutral-100"
              : "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          }`}
        >
          <Sun className="h-4 w-4 shrink-0" aria-hidden />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={isDark}
          aria-label="Dark theme"
          className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium motion-safe:transition-colors ${
            isDark
              ? "text-gray-900 dark:text-neutral-100"
              : "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          }`}
        >
          <Moon className="h-4 w-4 shrink-0" aria-hidden />
          <span>Dark</span>
        </button>
      </div>
    </div>
  );
}
