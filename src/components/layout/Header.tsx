import { Moon, Sun, Settings } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header
      className="flex h-12 items-center justify-between border-b border-border bg-card px-4"
      data-tauri-drag-region
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3" data-tauri-drag-region>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
          <span className="text-sm font-bold text-white">R2</span>
        </div>
        <h1 className="text-sm font-semibold" data-tauri-drag-region>
          R2 Explorer
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            "transition-colors"
          )}
          title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Settings */}
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            "transition-colors"
          )}
          title="设置"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
