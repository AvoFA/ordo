import Link from "next/link";
import { BookOpen, Compass, PlayCircle, Target } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

type LearningContextPanelProps = {
  path: string;
  topic: string;
  session: string;
  nextAction: string;
  description?: string;
  progress?: number;
  href?: string;
  variant?: "primary" | "compact";
};

export function LearningContextPanel({
  path,
  topic,
  session,
  nextAction,
  description,
  progress,
  href,
  variant = "compact",
}: LearningContextPanelProps) {
  const isPrimary = variant === "primary";

  return (
    <Card
      className={cn(
        "rounded-lg border-primary/20 bg-card shadow-none",
        isPrimary && "border-primary/30 shadow-[0_18px_45px_rgba(18,16,12,0.06)] dark:shadow-none",
      )}
    >
      <CardContent className={cn("p-4", isPrimary && "p-5 md:p-6")}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
              Current Learning Context
            </div>
            <div
              className={cn(
                "mt-3 grid gap-3 text-sm md:grid-cols-3",
                isPrimary && "md:grid-cols-[1fr_1fr_0.8fr]",
              )}
            >
              <ContextItem label="Path" value={path} icon={BookOpen} />
              <ContextItem label="Topic" value={topic} icon={Target} />
              <ContextItem label="Session" value={session} icon={PlayCircle} />
            </div>
            {description ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 rounded-lg border border-border/70 bg-secondary/35 p-4 lg:w-56">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Compass aria-hidden="true" className="h-3.5 w-3.5" />
                Next Action
              </span>
            </div>
            <div className="mt-2 text-sm font-semibold text-foreground">{nextAction}</div>
            {typeof progress === "number" ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Session progress</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}
            {href ? (
              <Button asChild size="sm" className="mt-4 w-full">
                <Link href={href}>{nextAction}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContextItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof BookOpen;
}) {
  return (
    <div className="min-w-0 rounded-md border border-border/65 bg-secondary/25 px-3 py-2.5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
