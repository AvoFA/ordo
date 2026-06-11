"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/shared/lib/utils";

type TextBlockTextareaProps = {
  content: string;
  onChange: (value: string) => void;
  onFocus: (el: HTMLTextAreaElement) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
};

export function TextBlockTextarea({
  content,
  onChange,
  onFocus,
  onPaste,
  onKeyDown,
  placeholder,
  className,
}: TextBlockTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  // Resize on value changes and mount
  useEffect(() => {
    resize();
  }, [content, resize]);

  // Handle window resizing
  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return (
    <textarea
      ref={(el) => {
        textareaRef.current = el;
        if (el) resize();
      }}
      value={content}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onFocus={(e) => onFocus(e.target)}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none bg-transparent outline-none font-mono text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/30 p-0 border-0 focus:ring-0 focus:outline-none min-h-[24px] overflow-hidden",
        className
      )}
    />
  );
}
