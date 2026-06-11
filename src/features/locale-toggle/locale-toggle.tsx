"use client";

import { Languages } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import type { Locale } from "@/shared/lib/i18n/i18n";

const options: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "uk", label: "UA" },
];

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border/50 bg-secondary/25 p-1",
        className,
      )}
      aria-label="Language selector"
    >
      <Languages aria-hidden="true" className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
      {options.map((option) => {
        const isActive = option.value === locale;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={cn(
              "h-7 rounded-md px-2 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
