"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type UserAccountMenuProps = {
  displayName: string;
  secondaryLabel: string;
  accountMenuLabel: string;
  settingsLabel: string;
  signOutLabel: string;
  signOutAction: (formData: FormData) => void | Promise<void>;
};

export function UserAccountMenu({
  displayName,
  secondaryLabel,
  accountMenuLabel,
  settingsLabel,
  signOutLabel,
  signOutAction,
}: UserAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={cn(
          "h-9 border border-border/60 bg-secondary/65 px-2.5 transition-colors",
          isOpen && "border-primary/35 bg-primary/10",
        )}
        aria-label={accountMenuLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <UserCircle aria-hidden="true" className="h-4 w-4" />
        <span className="hidden max-w-36 text-left leading-none sm:block">
          <span className="block truncate text-xs font-semibold text-foreground">
            {displayName}
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-muted-foreground">
            {secondaryLabel}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-border/70 bg-card p-2 shadow-xl shadow-black/10 dark:shadow-black/35"
        >
          <div className="rounded-xl bg-secondary/35 px-3 py-3">
            <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{secondaryLabel}</p>
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href="/settings"
              role="menuitem"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
              onClick={() => setIsOpen(false)}
            >
              <Settings aria-hidden="true" className="h-4 w-4" />
              {settingsLabel}
            </Link>

            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                {signOutLabel}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
