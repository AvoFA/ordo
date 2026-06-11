"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Circle, Clock3, Settings } from "lucide-react";
import type { TopicPreview as TopicPreviewModel } from "@/entities/topic/model/topic";
import Link from "next/link";
import { StartSessionForm } from "@/features/sessions/ui/start-session-form";
import { CompleteTopicForm } from "@/features/topics/ui/complete-topic-form";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/badge";
import { useUiStore } from "@/shared/model/ui-store";
import { cn } from "@/shared/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { EditTopicForm } from "@/features/topics/ui/edit-topic-form";
import { getTopicLearningStateLabel } from "@/entities/topic/model/topic-progress";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type TopicPreviewProps = {
  topic: TopicPreviewModel;
};

export function TopicPreview({ topic }: TopicPreviewProps) {
  const { isEditMode } = useUiStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t } = useTranslation();

  const completion = topic.completion ?? {
    state: topic.status === "completed" ? ("mastered" as const) : ("not-started" as const),
    signals: [
      {
        key: "session" as const,
        label: t("topics.signals.session"),
        description: t("topics.signals.sessionDesc"),
        complete: topic.status === "completed",
      },
      {
        key: "knowledge" as const,
        label: t("topics.signals.knowledge"),
        description: t("topics.signals.knowledgeDesc"),
        complete: topic.status === "completed",
      },
      {
        key: "practice" as const,
        label: t("topics.signals.practice"),
        description: t("topics.signals.practiceDesc"),
        complete: topic.status === "completed",
      },
    ],
    canComplete: false,
    isCompleted: topic.status === "completed",
    nextRequirement:
      topic.status === "completed"
        ? t("topics.signals.completed")
        : t("topics.signals.incomplete"),
    completedCount: topic.status === "completed" ? 5 : 0,
    checklistTotal: 5,
    percentage: topic.status === "completed" ? 100 : 0,
  };

  // Ensure signals have localized text if coming from default
  const signals = completion.signals.map(sig => {
    if (sig.key === "session") {
      return { ...sig, label: t("topics.signals.session"), description: t("topics.signals.sessionDesc") };
    }
    if (sig.key === "knowledge") {
      return { ...sig, label: t("topics.signals.knowledge"), description: t("topics.signals.knowledgeDesc") };
    }
    if (sig.key === "resource") {
      return { ...sig, label: t("topics.signals.resource"), description: t("topics.signals.resourceDesc") };
    }
    if (sig.key === "practiceAttempted") {
      return { ...sig, label: t("topics.signals.practiceAttempted"), description: t("topics.signals.practiceAttemptedDesc") };
    }
    if (sig.key === "practiceSolved") {
      return { ...sig, label: t("topics.signals.practiceSolved"), description: t("topics.signals.practiceSolvedDesc") };
    }
    return sig;
  });

  const nextRequirement = topic.status === "completed"
    ? t("topics.signals.completed")
    : t("topics.signals.incomplete");

  const sessionHref = topic.activeSessionId
    ? `/sessions/${topic.activeSessionId}`
    : topic.sessionId
      ? `/sessions/${topic.sessionId}`
      : undefined;

  const ctaButtons = (
    <div className="w-full">
      {completion.isCompleted ? (
        <Button type="button" className="w-full rounded-lg" disabled>
          {t("topics.completed")}
        </Button>
      ) : completion.canComplete ? (
        <div className="w-full">
          <CompleteTopicForm topicId={topic.id} />
        </div>
      ) : topic.activeSessionId ? (
        <Button asChild className="w-full rounded-lg">
          <Link href={`/sessions/${topic.activeSessionId}`}>{t("sessions.continueSession")}</Link>
        </Button>
      ) : !topic.sessionId ? (
        <div className="w-full">
          <StartSessionForm topicId={topic.id} />
        </div>
      ) : sessionHref ? (
        <Button asChild className="w-full rounded-lg">
          <Link href={sessionHref}>{t("nav.continueSession")}</Link>
        </Button>
      ) : (
        <Button type="button" className="w-full rounded-lg" disabled>
          {t("topics.startLearning")}
        </Button>
      )}
    </div>
  );

  return (
    <Card className="rounded-xl border border-border/40 bg-card shadow-none sticky top-0">
      <CardHeader className="pb-4 border-b border-border/20">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-snug">{topic.title}</CardTitle>
            <StatusBadge status={topic.status} className="shrink-0 mt-0.5" />
          </div>
          {isEditMode && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8 hover:bg-secondary/40 rounded-lg text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0">
                <div className="border-b border-border/70 px-6 py-5">
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {t("topics.configureTopic")}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm">
                    {t("topics.configureDesc")}
                  </DialogDescription>
                </div>
                <div className="px-6 py-5">
                  <EditTopicForm
                    topicId={topic.id}
                    initialTitle={topic.title}
                    initialDescription={topic.description}
                    initialEstimatedMinutes={topic.estimatedMinutes}
                    initialNextStep={topic.nextStep}
                    initialStatus={topic.status}
                    onSuccess={() => setIsEditDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Estimated Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span>{topic.estimatedMinutes ? `${topic.estimatedMinutes} ${t("practice.minutesUnit")}` : t("practice.notEstimated")}</span>
        </div>

        {/* Primary CTA (Start / Continue Session) — Elevated to the top of content */}
        <div className="pt-1 pb-2 border-b border-border/10">
          {ctaButtons}
        </div>

        {/* Description & Next Step Container */}
        {(topic.description || topic.nextStep) && (
          <div className="space-y-3.5 p-3.5 rounded-lg border border-border/30 bg-secondary/10">
            {topic.description && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {topic.description}
              </p>
            )}
            {topic.nextStep && (
              <div className="border-t border-border/20 pt-2.5">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-primary mb-1">
                  <BookOpen aria-hidden="true" className="h-3 w-3" />
                  {t("sessions.nextStep")}
                </div>
                <p className="text-xs leading-relaxed text-foreground font-medium">{topic.nextStep}</p>
              </div>
            )}
          </div>
        )}

        {/* Learning Progress */}
        <div className="rounded-lg border border-border/30 bg-secondary/10 p-3.5 space-y-3.5">
          <div className="flex items-center justify-between gap-3 border-b border-border/20 pb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("paths.learningProgress")}
              </div>
              <div className="mt-1 text-xs font-extrabold text-foreground">
                {completion.completedCount}/{completion.checklistTotal} {t("common.completed").toLowerCase()} &bull; {completion.percentage}%
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center rounded-md border border-border/50 bg-background/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {t(getTopicLearningStateLabel(completion.state))}
              </span>
            </div>
          </div>
          <div className="space-y-2.5">
            {signals.map((signal) => (
              <div key={signal.key} className="flex items-start gap-2 text-[11px] leading-relaxed">
                {signal.complete ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/45" />
                )}
                <div className="min-w-0">
                  <div className={cn("font-bold", signal.complete ? "text-foreground" : "text-muted-foreground/85")}>{signal.label}</div>
                  <div className="text-[10px] text-muted-foreground/60 leading-normal mt-0.5">
                    {signal.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/25 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">{t("analytics.recommendedNext")}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {nextRequirement}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3 py-3 px-5 border-t border-border/20 bg-secondary/5 rounded-b-xl">
        <span className="text-[10px] text-muted-foreground/75 font-semibold uppercase tracking-wider">
          {t("practice.connectedToTopic")}
        </span>
      </CardFooter>
    </Card>
  );
}
