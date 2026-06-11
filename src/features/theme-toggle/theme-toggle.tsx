"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/shared/theme/theme-provider";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const activeTheme = mounted ? (theme ?? "system") : "system";

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Laptop, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ] as const;

  return (
    <div 
      className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-secondary/25 p-0.5" 
      role="radiogroup" 
      aria-label="Theme switcher"
    >
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = activeTheme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isActive
                ? "bg-card text-primary shadow-xs border border-border/10 font-bold scale-[1.02]"
                : "hover:bg-secondary/40 hover:text-foreground"
            )}
            title={label}
            aria-label={`Switch to ${label} theme`}
            aria-checked={isActive}
            role="radio"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
