"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search, BookOpen } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { cn } from "@/shared/lib/utils";

export type ComboboxOption = {
  id: string;
  label: string;
  group: string;
};

type TopicComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  name?: string;
  required?: boolean;
};

export function TopicCombobox({
  options,
  value,
  onChange,
  placeholder = "Choose topic",
  searchPlaceholder = "Search topics...",
  emptyText = "No topics found.",
  name,
  required,
}: TopicComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  // Group options by their group label
  const grouped = options.reduce<Record<string, ComboboxOption[]>>((acc, option) => {
    if (!acc[option.group]) acc[option.group] = [];
    acc[option.group].push(option);
    return acc;
  }, {});

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm transition-all outline-none",
          "hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          open && "border-ring ring-[3px] ring-ring/50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected ? (
            <>
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate font-medium text-foreground">
                <span className="text-muted-foreground/60 font-normal">{selected.group} / </span>
                {selected.label}
              </span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border border-border/70 bg-card shadow-xl shadow-black/20 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <Command>
            <div className="flex h-10 items-center gap-2 border-b border-border/50 px-3">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              <CommandInput
                placeholder={searchPlaceholder}
                className="text-xs"
              />
            </div>
            <CommandList className="max-h-[220px]">
              <CommandEmpty className="py-6 text-xs text-muted-foreground/70 text-center">
                {emptyText}
              </CommandEmpty>
              {Object.entries(grouped).map(([group, items]) => (
                <CommandGroup key={group} heading={group}>
                  {items.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={`${group} ${option.label}`}
                      onSelect={() => {
                        onChange(option.id);
                        setOpen(false);
                      }}
                      className="text-xs py-2"
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-primary transition-opacity",
                          value === option.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
