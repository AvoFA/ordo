"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import { CheckCircle2, Circle, Clock3, RotateCcw, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import type { TranslationKey } from "@/shared/lib/i18n/i18n";

type BadgeVariant = "metadata" | "tag" | "difficulty" | "focus" | "status";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
};

export function Badge({ children, variant = "metadata", icon: Icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-medium leading-none tracking-wider",
        "transition-colors",
        variant === "metadata" && "border-border/35 bg-secondary/20 text-muted-foreground font-normal",
        variant === "tag" && "border-border/35 bg-secondary/25 text-muted-foreground font-normal",
        variant === "difficulty" && "border-primary/15 bg-primary/5 text-foreground",
        variant === "focus" && "border-primary/20 bg-accent/30 text-accent-foreground",
        variant === "status" && "border-border/35 bg-secondary/25 text-foreground",
        className,
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /> : null}
      {children}
    </span>
  );
}

type LearningStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "review-later"
  | "review"
  | "ready-to-start"
  | "learning"
  | "needs-review"
  | "practicing"
  | "mastered"
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"
  | "NOT_STARTED"
  | "LEARNING"
  | "REVIEW_LATER"
  | "COMPLETED";

const statusConfig: Record<
  LearningStatus,
  {
    labelKey: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    className: string;
  }
> = {
  "not-started": {
    labelKey: "states.not-started",
    icon: Circle,
    className: "border-state-ready-border bg-state-ready-bg text-state-ready-text",
  },
  "ready-to-start": {
    labelKey: "states.not-started",
    icon: Circle,
    className: "border-state-ready-border bg-state-ready-bg text-state-ready-text",
  },
  "TODO": {
    labelKey: "states.not-started",
    icon: Circle,
    className: "border-state-ready-border bg-state-ready-bg text-state-ready-text",
  },
  "NOT_STARTED": {
    labelKey: "states.not-started",
    icon: Circle,
    className: "border-state-ready-border bg-state-ready-bg text-state-ready-text",
  },
  "in-progress": {
    labelKey: "states.learning",
    icon: BookOpen,
    className: "border-state-learning-border bg-state-learning-bg text-state-learning-text font-semibold",
  },
  learning: {
    labelKey: "states.learning",
    icon: BookOpen,
    className: "border-state-learning-border bg-state-learning-bg text-state-learning-text font-semibold",
  },
  "IN_PROGRESS": {
    labelKey: "states.learning",
    icon: BookOpen,
    className: "border-state-learning-border bg-state-learning-bg text-state-learning-text font-semibold",
  },
  "LEARNING": {
    labelKey: "states.learning",
    icon: BookOpen,
    className: "border-state-learning-border bg-state-learning-bg text-state-learning-text font-semibold",
  },
  practicing: {
    labelKey: "states.practicing",
    icon: Clock3,
    className: "border-state-practicing-border bg-state-practicing-bg text-state-practicing-text font-semibold",
  },
  "review-later": {
    labelKey: "states.review-needed",
    icon: RotateCcw,
    className: "border-state-review-border bg-state-review-bg text-state-review-text",
  },
  review: {
    labelKey: "states.review-needed",
    icon: RotateCcw,
    className: "border-state-review-border bg-state-review-bg text-state-review-text",
  },
  "needs-review": {
    labelKey: "states.review-needed",
    icon: RotateCcw,
    className: "border-state-review-border bg-state-review-bg text-state-review-text",
  },
  "REVIEW_LATER": {
    labelKey: "states.review-needed",
    icon: RotateCcw,
    className: "border-state-review-border bg-state-review-bg text-state-review-text",
  },
  completed: {
    labelKey: "states.mastered",
    icon: CheckCircle2,
    className: "border-state-mastered-border bg-state-mastered-bg text-state-mastered-text font-semibold",
  },
  mastered: {
    labelKey: "states.mastered",
    icon: CheckCircle2,
    className: "border-state-mastered-border bg-state-mastered-bg text-state-mastered-text font-semibold",
  },
  "DONE": {
    labelKey: "states.mastered",
    icon: CheckCircle2,
    className: "border-state-mastered-border bg-state-mastered-bg text-state-mastered-text font-semibold",
  },
  "COMPLETED": {
    labelKey: "states.mastered",
    icon: CheckCircle2,
    className: "border-state-mastered-border bg-state-mastered-bg text-state-mastered-text font-semibold",
  },
};

type StatusBadgeProps = {
  status: LearningStatus;
  className?: string;
  label?: string;
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status] || statusConfig["not-started"];

  return (
    <Badge variant="status" icon={config.icon} className={cn(config.className, className)}>
      {label ?? t(config.labelKey as TranslationKey)}
    </Badge>
  );
}
