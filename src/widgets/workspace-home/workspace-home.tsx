"use client";

import Link from "next/link";
import { Activity, ArrowRight, BookOpen, Inbox, AlertTriangle, Map, Clock3, Target, type LucideIcon } from "lucide-react";
import type { LearningSession, SuggestedSessionTopic } from "@/entities/session/model/session";
import { StartSessionForm } from "@/features/sessions/ui/start-session-form";
import { Badge, StatusBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { PracticeTaskPreview } from "@/entities/practice-task/model/practice-task";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type WorkspaceHomeProps = {
  activeSession: LearningSession | null;
  suggestedTopic: SuggestedSessionTopic | null;
  pathCount: number;
  recentSessionCount: number;
  activePracticeTasks?: PracticeTaskPreview[];
  practiceTasksNeedingReview?: PracticeTaskPreview[];
  inboxCount?: number;
};

export function WorkspaceHome({
  activeSession,
  suggestedTopic,
  pathCount,
  recentSessionCount,
  activePracticeTasks = [],
  practiceTasksNeedingReview = [],
  inboxCount = 0,
}: WorkspaceHomeProps) {
  const { t } = useTranslation();
  const hasActiveSession = Boolean(activeSession);
  const primaryPath = activeSession?.path ?? suggestedTopic?.path ?? "";
  const primaryTopic = activeSession?.topic ?? suggestedTopic?.title ?? "";
  
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Full-width Header Section */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-primary/75">
            {t("nav.flowGroup")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("today.title")}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("today.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-[320px] shrink-0">
          <MetricTile icon={Map} label={t("today.pathsMetric")} value={pathCount} />
          <MetricTile icon={Clock3} label={t("today.sessionsMetric")} value={recentSessionCount} />
          <MetricTile icon={Target} label={t("today.practiceMetric")} value={activePracticeTasks.length} />
        </div>
      </section>

      {/* Symmetrical 2-Column Grid */}
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_360px] items-start">
        {/* Left Column: Flow & Main Learning Focus */}
        <div className="space-y-6">
          {/* Main Focus: Continue Learning */}
          <Card className={cn(
            "rounded-2xl p-6 border-2 transition-all duration-300 relative overflow-hidden shadow-md",
            hasActiveSession
              ? "border-primary/45 bg-primary/[0.03] shadow-[0_4px_20px_-4px_rgba(36,58,74,0.05)]"
              : "border-border/60 bg-card/80"
          )}>
            {/* Top Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/10">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {hasActiveSession ? t("today.continueLearning") : t("today.noActiveGoals")}
                </p>
                <h2 className="mt-1 text-lg font-bold text-foreground leading-tight">
                  {primaryPath || t("today.noPathYet")}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={hasActiveSession ? "in-progress" : "not-started"} />
              </div>
            </div>

            {/* Content Details */}
            <div className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground leading-snug md:text-2xl">
                  {primaryTopic || t("today.createFirstPathDesc")}
                </h3>
                {activeSession?.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {activeSession.description}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/30 bg-secondary/15 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/85">
                    <BookOpen aria-hidden="true" className="h-3.5 w-3.5 text-primary/60" />
                    {t("sessions.sessionGoal")}
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {activeSession?.goal ??
                      (suggestedTopic
                        ? t("today.startSessionGoal")
                        : t("today.createTopicGoal"))}
                  </p>
                </div>
                
                <div className="rounded-xl border border-border/30 bg-secondary/15 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/85">
                    <Activity aria-hidden="true" className="h-3.5 w-3.5 text-primary/60" />
                    {t("sessions.nextStep")}
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {activeSession?.nextStep ?? suggestedTopic?.nextStep ?? t("today.createPathNextStep")}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-wrap gap-3">
                {activeSession ? (
                  <Button asChild className="gap-2 shadow-sm rounded-lg hover:translate-y-[-1px] transition-transform px-5">
                    <Link href={`/sessions/${activeSession.id}`}>
                      {t("today.continueSessionBtn")}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : suggestedTopic ? (
                  <StartSessionForm topicId={suggestedTopic.id} />
                ) : (
                  <Button asChild className="rounded-lg shadow-sm px-5">
                    <Link href="/learning-paths">{t("today.createPathBtn")}</Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="border-border/60 hover:bg-secondary/40 rounded-lg px-5">
                  <Link href={suggestedTopic ? `/learning-paths/${suggestedTopic.pathSlug}` : "/learning-paths"}>
                    {t("today.viewRoadmapBtn")}
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Alerts & Needs Attention (Starts at same height) */}
        <aside className="space-y-6">
          {/* Learning Pulse Card */}
          <Card className="rounded-xl border border-border/30 bg-card shadow-sm p-5 gap-0 overflow-hidden relative group">
            {/* Subtle background glow effect if active */}
            {hasActiveSession && (
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500 pointer-events-none" />
            )}
            
            <div className="flex items-center justify-between pb-3 border-b border-border/10 mb-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className={cn(
                  "relative flex h-2 w-2",
                  hasActiveSession && "scale-110"
                )}>
                  {hasActiveSession && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    hasActiveSession ? "bg-emerald-500" : "bg-muted-foreground/45"
                  )} />
                </span>
                {t("today.learningPulse")}
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                hasActiveSession 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                  : "bg-secondary text-muted-foreground"
              )}>
                {hasActiveSession ? "Active" : "Idle"}
              </span>
            </div>

            <div className="space-y-4">
              {hasActiveSession && activeSession ? (
                // Active State: Real Session Progress
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("today.learningPulseActive")}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                      <span>{activeSession.progressLabel || "Progress"}</span>
                      <span className="text-primary">{activeSession.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden relative border border-border/10">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${activeSession.progress}%` }}
                      />
                    </div>
                    {activeSession.progressDescription && (
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                        {activeSession.progressDescription}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Idle State: Weekly Activity Rhythm Tracker
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("today.learningPulseQuiet")}
                  </p>
                  
                  {/* 7-day Streak / Activity Grid */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Weekly rhythm</span>
                      <span className="text-foreground">{recentSessionCount} sessions</span>
                    </div>
                    
                    {/* Seven dots representing Mon-Sun activity */}
                    <div className="grid grid-cols-7 gap-1.5 pt-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                        // Mock active days based on recentSessionCount to show historical rhythm
                        const isActive = idx < Math.min(recentSessionCount, 7) && recentSessionCount > 0;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-semibold text-muted-foreground/60">{day}</span>
                            <div 
                              className={cn(
                                "h-6 w-full rounded-md flex items-center justify-center text-[10px] font-bold transition-all border",
                                isActive 
                                  ? "bg-primary/10 border-primary/20 text-primary font-bold shadow-2xs" 
                                  : "bg-secondary/15 border-border/10 text-muted-foreground/35"
                              )}
                              title={isActive ? "Session completed" : "No session"}
                            >
                              {isActive ? "✓" : "·"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Intake Queue card */}
          {inboxCount > 0 && (
            <Card className="rounded-xl border border-border/35 bg-card shadow-sm p-5 gap-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-primary/10 p-2 shrink-0">
                    <Inbox className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {t("today.intakeQueue")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("today.intakeItemsWaiting", { count: inboxCount })}
                    </p>
                  </div>
                </div>
                <Button asChild variant="secondary" size="sm" className="shrink-0 rounded-lg border border-border/60 h-9 font-bold px-3">
                  <Link href="/inbox">{t("today.assign")}</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Practice Needing Review card */}
          {practiceTasksNeedingReview.length > 0 && (
            <Card className="rounded-xl border border-border/30 bg-card shadow-sm p-5 gap-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-3 border-b border-border/10 mb-4">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                {t("today.practiceNeedingReview")}
              </div>
              <div className="divide-y divide-border/10">
                {practiceTasksNeedingReview.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 space-y-1">
                      <span className="text-xs font-bold text-foreground truncate block">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground/85 block uppercase tracking-wider font-semibold">
                        {task.linkedPath} &bull; {task.linkedTopic}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="tag" className="text-[9px] border-destructive/20 bg-destructive/10 text-destructive font-bold uppercase">
                        {task.attemptSummary?.latestResult === "failed" ? t("common.needsReview") : "Partial"}
                      </Badge>
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-bold px-2.5 rounded-md hover:bg-secondary/40 text-primary">
                        <Link href="/practice">{t("nav.practice")}</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Catch-up Empty State */}
          {inboxCount === 0 && practiceTasksNeedingReview.length === 0 && (
            <Card className="rounded-xl border border-dashed border-border/40 bg-secondary/5 p-6 flex items-center justify-center text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                ✨ {t("today.allCaughtUpDesc") || "All caught up! No reviews or assignments need your immediate focus."}
              </p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

type MetricTileProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
};

function MetricTile({ icon: Icon, label, value }: MetricTileProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/30 bg-card p-3 text-center transition-all hover:bg-secondary/15">
      <Icon className="h-4 w-4 text-primary/70 mb-1" />
      <span className="text-lg font-bold text-foreground leading-none">{value}</span>
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}
