"use client";

import type { LearningPathPreview } from "@/entities/learning-path/model/learning-path";
import { BookOpen, ArrowRight, Milestone } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type ActivePathCardProps = {
  learningPath: LearningPathPreview;
};

export function ActivePathCard({ learningPath }: ActivePathCardProps) {
  const { t } = useTranslation();
  const pathHref = `/learning-paths/${learningPath.slug}`;
  const completedCount = learningPath.completedTopicCount ?? 0;
  const totalCount = learningPath.topicCount;

  let progressLabel = t("common.readyToStart");
  if (totalCount === 0) {
    progressLabel = t("common.readyToStart");
  } else if (learningPath.progress === 100) {
    progressLabel = t("common.completed");
  } else if (learningPath.progress > 0) {
    progressLabel = t("paths.completedTopicsOf", {
      completed: completedCount,
      total: totalCount,
    });
  }

  return (
    <Card className="rounded-xl border-2 border-primary/35 bg-primary/[0.02] shadow-[0_4px_16px_-4px_rgba(36,58,74,0.08)] transition-all duration-300 hover:border-primary/55 overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/10">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              {t("paths.continueLearningSection")}
            </h4>
            <Link href={pathHref} className="group inline-flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {learningPath.title}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="rounded-full border border-border/40 bg-secondary/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {learningPath.progress}%
            </span>
            <StatusBadge status={learningPath.status ?? "learning"} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Current Focus */}
          <div className="rounded-lg border border-border/30 bg-secondary/15 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/85">
              <BookOpen className="h-3.5 w-3.5 text-primary/60" />
              {t("sessions.activeSession")}
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {learningPath.focus}
            </p>
          </div>

          {/* Next Recommended Step */}
          {learningPath.nextStep && (
            <div className="rounded-lg border border-border/30 bg-secondary/15 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/75">
                <Milestone className="h-3.5 w-3.5" />
                {t("sessions.nextStep")}
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug truncate">
                {learningPath.nextStep}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs font-medium text-muted-foreground">
            {progressLabel}
          </div>
          <Button asChild size="sm" className="gap-1.5 rounded-lg shadow-sm">
            <Link href={pathHref}>
              {t("nav.continueSession")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
