"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import type { Editor } from "@tiptap/react";

export type SlashCommand = {
  icon: React.ElementType;
  label: string;
  action: (editor: Editor) => void;
  description?: string;
};

type SlashMenuProps = {
  commands: SlashCommand[];
  selectedIndex: number;
  onSelectCommand: (cmd: SlashCommand) => void;
  onHoverIndex: (index: number) => void;
  query: string;
  x: number;
  y: number;
};

export function SlashMenu({
  commands,
  selectedIndex,
  onSelectCommand,
  onHoverIndex,
  query,
  x,
  y,
}: SlashMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Adjust menu position if it goes off-screen horizontally or vertically
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Overflows right
    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 16;
    }
    // Overflows bottom
    if (y + rect.height > viewportHeight) {
      adjustedY = y - rect.height - 32; // position above cursor instead
    }

    el.style.left = `${Math.max(16, adjustedX)}px`;
    el.style.top = `${Math.max(16, adjustedY)}px`;
  }, [x, y, commands]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-background/95 backdrop-blur-md border border-border/40 rounded-xl shadow-xl overflow-hidden w-64 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-secondary/10 border-b border-border/15">
        Editor Commands {query && `matching "${query}"`}
      </div>
      <div className="p-1.5 space-y-0.5">
        {commands.length === 0 ? (
          <div className="px-2 py-4 text-xs text-muted-foreground italic text-center">
            No commands found
          </div>
        ) : (
          commands.map((cmd, idx) => {
            const isActive = idx === selectedIndex;
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.label}
                ref={isActive ? activeItemRef : null}
                type="button"
                onClick={() => onSelectCommand(cmd)}
                onMouseEnter={() => onHoverIndex(idx)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg flex items-start gap-3 text-xs transition-all duration-150 font-medium cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground/80 hover:bg-secondary/40 hover:text-foreground"
                )}
              >
                <div className={cn("p-1 rounded-md mt-0.5", isActive ? "bg-primary-foreground/15" : "bg-secondary/40")}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="font-semibold">{cmd.label}</span>
                  {cmd.description && (
                    <span className={cn("text-[10px] mt-0.5", isActive ? "text-primary-foreground/70" : "text-muted-foreground/60")}>
                      {cmd.description}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
