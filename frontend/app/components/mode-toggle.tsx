import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Toggle theme"
      >
        {/* Sun icon (visible in light mode) */}
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        {/* Moon icon (visible in dark mode) */}
        <Moon className="absolute h-[1.2rem] w-[1.2rem] text-blue-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>
    </div>
  );
}
