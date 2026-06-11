import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

type KbdProps = ComponentProps<"kbd">;

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border/80 bg-secondary/55 px-1.5 text-[10px] font-medium leading-none text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
