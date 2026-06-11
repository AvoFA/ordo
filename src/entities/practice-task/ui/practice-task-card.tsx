"use client";

import { useState, useRef, useEffect } from "react";
import type { PracticeTaskPreview } from "@/entities/practice-task/model/practice-task";
import { ArrowRight, Clock3, Signal, Settings, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { useUiStore } from "@/shared/model/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { EditPracticeTaskForm } from "@/features/practice/ui/edit-practice-task-form";
import { RecordPracticeAttemptForm } from "@/features/practice/ui/record-practice-attempt-form";
import { updatePracticeTaskStatusAction } from "@/features/practice/actions/practice.actions";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { cn } from "@/shared/lib/utils";

type PracticeTaskCardProps = {
  task: PracticeTaskPreview;
  variant?: "default" | "compact" | "recommended";
};

export function PracticeTaskCard({ task, variant = "default" }: PracticeTaskCardProps) {
  const isCompact = variant === "compact";
  const isRecommended = variant === "recommended";
  const { isEditMode } = useUiStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150); // slight delay to allow smooth accordion expansion in DOM
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const initialEstimatedMinutes = parseInt(task.estimatedTime, 10) || undefined;
  const attemptSummary = task.attemptSummary;

  const latestResultLabel = attemptSummary?.latestResult
    ? {
        success: t("practice.resultSolved"),
        partial: t("practice.resultPartial"),
        failed: t("practice.resultBlocked"),
      }[attemptSummary.latestResult]
    : undefined;

  const nextAction =
    task.status === "completed"
      ? t("practice.nextActionEvidence")
      : latestResultLabel === t("practice.resultBlocked") || latestResultLabel === t("practice.resultPartial")
        ? t("practice.nextActionBlocked")
        : attemptSummary && attemptSummary.total > 0
          ? t("practice.nextActionRepeat")
          : t("practice.nextActionStart");

  const statusLabel = {
    "not-started": t("common.readyToStart"),
    "in-progress": t("common.inProgress"),
    "completed": t("common.completed"),
  }[task.status];

  const editDialog = isEditMode && (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 hover:bg-secondary/40 rounded-lg text-muted-foreground hover:text-foreground"
          title={t("practice.configurePractice")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <div className="space-y-1 mb-4">
          <DialogTitle className="text-lg font-bold">{t("practice.configurePractice")}</DialogTitle>
          <DialogDescription className="text-xs">
            {t("practice.configureDesc")}
          </DialogDescription>
        </div>
        <EditPracticeTaskForm
          taskId={task.id}
          initialTitle={task.title}
          initialDescription={task.description}
          initialDifficulty={task.difficulty}
          initialEstimatedMinutes={initialEstimatedMinutes}
          initialStatus={task.status}
          onSuccess={() => setIsEditDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );

  const difficultyLabel = {
    Foundation: t("practice.difficultyFoundation"),
    Intermediate: t("practice.difficultyIntermediate"),
    Applied: t("practice.difficultyApplied"),
  }[task.difficulty] || task.difficulty;

  const displayTime = task.estimatedTime === "Not estimated" 
    ? t("practice.notEstimated") 
    : task.estimatedTime;

  if (isCompact) {
    return (
      <div 
        ref={cardRef}
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border/25 bg-card/45 p-4 transition-all duration-300 hover:border-primary/35 hover:bg-card shadow-sm",
          isExpanded ? "border-primary/25 bg-card/70" : ""
        )}
      >
        {/* Toggle Header Row */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-start justify-between gap-3 cursor-pointer select-none"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold leading-snug text-foreground">
                {task.title}
              </h4>
              <StatusBadge status={task.status} label={statusLabel} className="text-[9px] px-1.5 py-0.5 rounded-md shrink-0" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
              {task.linkedPath} &bull; {task.linkedTopic}
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {editDialog}
            <button 
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground/50 hover:text-foreground p-1 transition-colors cursor-pointer"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isExpanded && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Expandable Body Content */}
        {isExpanded ? (
          <div className="pt-3 border-t border-border/10 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
                {t("practice.descriptionLabel") || "Опис"}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>

            {task.instruction && (
              <div className="rounded-lg border border-border/40 bg-secondary/25 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
                  {t("practice.instruction") || "Інструкція"}
                </span>
                <p className="text-xs leading-relaxed text-foreground">
                  {task.instruction}
                </p>
              </div>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground/80 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Signal aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span>{difficultyLabel}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span>{displayTime}</span>
              </span>
            </div>

            {/* Combined Practice Progress Box */}
            <div className="rounded-xl border border-border/20 bg-secondary/5 overflow-hidden">
              {attemptSummary && attemptSummary.total > 0 ? (
                <div className="p-3 border-b border-border/10">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/85">
                    <span>{t("practice.learningEvidence")}</span>
                    <span className="text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded-sm">
                      {t("practice.usefulAttempts", { successful: attemptSummary.successful, total: attemptSummary.total })
                        .replace("{successful}", String(attemptSummary.successful))
                        .replace("{total}", String(attemptSummary.total))}
                    </span>
                  </div>
                  {latestResultLabel && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground">{t("practice.latestResult").replace("{result}", "")}:</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                        attemptSummary.latestResult === "success" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : attemptSummary.latestResult === "partial" 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}>
                        {latestResultLabel}
                      </span>
                    </div>
                  )}
                  {attemptSummary.latestReflection && (
                    <p className="mt-2 text-xs leading-5 text-foreground/80 italic pl-2 border-l-2 border-primary/30">
                      &ldquo;{attemptSummary.latestReflection}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 border-b border-border/10 text-center text-xs text-muted-foreground/70">
                  {t("practice.noAttemptsYet") || "Немає спроб"}
                </div>
              )}

              <div className="bg-secondary/10 p-3 flex items-start gap-2">
                <span className="mt-0.5 shrink-0 block h-1.5 w-1.5 rounded-full bg-primary" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 block">
                    {t("practice.nextAction")}
                  </span>
                  <p className="text-xs text-foreground/90 font-medium leading-relaxed">{nextAction}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/10">
              {task.status !== "in-progress" && task.status !== "completed" && (
                <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="status" value="in-progress" />
                  <Button type="submit" variant="secondary" size="sm" className="h-8 rounded-lg border border-border/50 px-3 text-xs font-semibold">
                    {t("practice.actionStart")}
                  </Button>
                </form>
              )}

              {task.status === "in-progress" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-8 rounded-lg border border-border/50 px-3 text-xs font-semibold">
                      {t("practice.recordAttempt")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-6">
                    <DialogTitle className="text-lg font-bold">{t("practice.recordAttemptHeader")}</DialogTitle>
                    <DialogDescription className="text-xs -mt-1 text-muted-foreground">
                      {t("practice.recordAttemptSub")}
                    </DialogDescription>
                    <div className="mt-4">
                      <RecordPracticeAttemptForm taskId={task.id} />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {task.status !== "completed" && (
                <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="status" value="completed" />
                  <Button type="submit" variant="outline" size="sm" className="h-8 rounded-lg border border-border/60 px-3 text-xs font-semibold">
                    {t("practice.actionMarkDone")}
                  </Button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Collapsed compact footer view */
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/10 text-xs text-muted-foreground">
            <span className="font-semibold text-[10px] text-primary/85 flex items-center gap-1">
              <span className="text-muted-foreground/60 uppercase tracking-wider font-bold">{t("practice.nextAction")}:</span>
              {nextAction}
            </span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {task.status !== "in-progress" && task.status !== "completed" && (
                <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="status" value="in-progress" />
                  <Button type="submit" variant="secondary" size="xs" className="h-7 rounded-md border border-border/50 px-2 text-[10px] font-semibold cursor-pointer">
                    {t("practice.actionStart")}
                  </Button>
                </form>
              )}

              {task.status === "in-progress" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="xs" className="h-7 rounded-md border border-border/50 px-2 text-[10px] font-semibold cursor-pointer">
                      {t("practice.recordAttempt")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-6">
                    <DialogTitle className="text-lg font-bold">{t("practice.recordAttemptHeader")}</DialogTitle>
                    <DialogDescription className="text-xs -mt-1 text-muted-foreground">
                      {t("practice.recordAttemptSub")}
                    </DialogDescription>
                    <div className="mt-4">
                      <RecordPracticeAttemptForm taskId={task.id} />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isRecommended) {
    return (
      <Card className="rounded-2xl border border-primary/25 bg-card shadow-sm shadow-primary/5 transition-colors hover:border-primary/45">
        <CardHeader className="px-5 pb-3 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base font-bold leading-snug text-foreground">
                {task.title}
              </CardTitle>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/75">
                {task.linkedPath} &bull; {task.linkedTopic}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} label={statusLabel} className="shrink-0" />
              {editDialog}
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 px-5 pb-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <p className="max-w-2xl text-sm leading-6 text-foreground/82">{task.description}</p>
            <div className="rounded-xl border border-border/20 bg-secondary/10 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
                {t("practice.nextAction")}
              </span>
              <p className="mt-1 text-sm font-semibold leading-6 text-foreground">{nextAction}</p>
            </div>
          </div>

          <div className="grid content-start gap-2 rounded-xl border border-border/20 bg-secondary/10 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Signal className="h-3.5 w-3.5" />
                {difficultyLabel}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {displayTime}
              </span>
            </div>
            <div className="border-t border-border/15 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
                {t("practice.learningEvidence")}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {attemptSummary && attemptSummary.total > 0
                  ? t("practice.usefulAttempts", { successful: attemptSummary.successful, total: attemptSummary.total })
                      .replace("{successful}", String(attemptSummary.successful))
                      .replace("{total}", String(attemptSummary.total))
                  : t("practice.noAttemptsYet")}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-3 rounded-b-2xl border-t border-border/20 bg-secondary/5 px-5 py-3.5">
          <p className="hidden text-xs text-muted-foreground/65 sm:block">
            {t("practice.trainingSurfaceHint")}
          </p>
          <div className="ml-auto flex items-center gap-2">
            {task.status !== "in-progress" && task.status !== "completed" && (
              <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="status" value="in-progress" />
                <Button type="submit" size="sm" className="gap-1.5 rounded-lg px-3.5 text-xs font-semibold">
                  {t("practice.actionStart")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            )}

            {task.status === "in-progress" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 rounded-lg px-3.5 text-xs font-semibold">
                    {t("practice.recordAttempt")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md p-6">
                  <DialogTitle className="text-lg font-bold">{t("practice.recordAttemptHeader")}</DialogTitle>
                  <DialogDescription className="text-xs -mt-1 text-muted-foreground">
                    {t("practice.recordAttemptSub")}
                  </DialogDescription>
                  <div className="mt-4">
                    <RecordPracticeAttemptForm taskId={task.id} />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {task.status !== "completed" && (
              <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="status" value="completed" />
                <Button type="submit" variant="outline" size="sm" className="rounded-lg px-3.5 text-xs font-semibold">
                  {t("practice.actionMarkDone")}
                </Button>
              </form>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border/30 bg-card/60 shadow-sm transition-all duration-300 hover:border-primary/45 hover:bg-card hover:shadow-md">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold leading-tight text-foreground">
              {task.title}
            </CardTitle>
            <p className="mt-1.5 text-xs font-medium text-muted-foreground/80 tracking-wide uppercase">
              {task.linkedPath} &bull; {task.linkedTopic}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} label={statusLabel} className="shrink-0" />
            {editDialog}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 space-y-3">
        <p className="text-xs leading-relaxed text-muted-foreground">{task.description}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground/80 font-semibold pt-2 border-t border-border/10">
          <span className="flex items-center gap-1">
            <Signal aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span>{difficultyLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span>{displayTime}</span>
          </span>
          {task.tags && task.tags.length > 0 && (
            <span className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <span key={tag} className="text-[9px] text-muted-foreground/60 bg-secondary/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Combined Practice Progress Box */}
        <div className="rounded-xl border border-border/20 bg-secondary/5 overflow-hidden">
          {attemptSummary && attemptSummary.total > 0 ? (
            <div className="p-3 border-b border-border/10">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/85">
                <span>{t("practice.learningEvidence")}</span>
                <span className="text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded-sm">
                  {t("practice.usefulAttempts", { successful: attemptSummary.successful, total: attemptSummary.total }).replace("{successful}", String(attemptSummary.successful)).replace("{total}", String(attemptSummary.total))}
                </span>
              </div>
              {latestResultLabel && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground">{t("practice.latestResult").replace("{result}", "")}:</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                    attemptSummary.latestResult === "success" 
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                      : attemptSummary.latestResult === "partial" 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}>
                    {latestResultLabel}
                  </span>
                </div>
              )}
              {attemptSummary.latestReflection && (
                <p className="mt-2 text-xs leading-5 text-foreground/80 italic pl-2 border-l-2 border-primary/30">
                  &ldquo;{attemptSummary.latestReflection}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 border-b border-border/10 text-center text-xs text-muted-foreground/70">
              {t("practice.emptyNeedsReview") /* or similar: no attempts recorded yet */}
            </div>
          )}

          <div className="bg-secondary/10 p-3 flex items-start gap-2">
            <span className="mt-0.5 shrink-0 block h-1.5 w-1.5 rounded-full bg-primary" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 block">
                {t("practice.nextAction")}
              </span>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">{nextAction}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3 px-5 py-3.5 border-t border-border/20 bg-secondary/5 rounded-b-xl">
        <p className="text-xs text-muted-foreground/60">
          {t("practice.connectedToTopic")}
        </p>
        <div className="flex items-center gap-2">
          {task.status !== "in-progress" && task.status !== "completed" && (
            <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="status" value="in-progress" />
              <Button type="submit" variant="secondary" size="sm" className="border border-border/50 hover:bg-secondary/40 rounded-lg text-xs font-semibold px-3.5 py-1.5 shadow-sm">
                {t("practice.actionStart")}
              </Button>
            </form>
          )}

          {task.status === "in-progress" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="border border-border/50 hover:bg-secondary/40 rounded-lg text-xs font-semibold px-3.5 py-1.5 shadow-sm">
                  {t("practice.recordAttempt")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md p-6">
                <DialogTitle className="text-lg font-bold">{t("practice.recordAttemptHeader")}</DialogTitle>
                <DialogDescription className="text-xs -mt-1 text-muted-foreground">
                  {t("practice.recordAttemptSub")}
                </DialogDescription>
                <div className="mt-4">
                  <RecordPracticeAttemptForm taskId={task.id} />
                </div>
              </DialogContent>
            </Dialog>
          )}

          {task.status !== "completed" && (
            <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="status" value="completed" />
              <Button type="submit" variant="outline" size="sm" className="border border-border/60 hover:bg-secondary/45 rounded-lg text-xs font-semibold px-3.5 py-1.5">
                {t("practice.actionMarkDone")}
              </Button>
            </form>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
