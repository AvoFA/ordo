"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import type { LearningSession } from "@/entities/session/model/session";
import type { NotePreview } from "@/entities/note/model/note";
import type { PracticeTaskPreview } from "@/entities/practice-task/model/practice-task";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock3, 
  Maximize2, 
  Minimize2, 
  Target, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Play, 
  Pause 
} from "lucide-react";
import { FinishSessionForm } from "@/features/sessions/ui/finish-session-form";
import { DiscardSessionForm } from "@/features/sessions/ui/discard-session-form";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { SessionNotes } from "@/widgets/session-notes/session-notes";
import { SessionPractice } from "@/widgets/session-practice/session-practice";
import { SessionResources } from "@/widgets/session-resources/session-resources";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { deriveTopicCompletion, getTopicLearningStateLabel } from "@/entities/topic/model/topic-progress";

type SessionWorkspaceProps = {
  session: LearningSession;
  notes: NotePreview[];
  practiceTasks: PracticeTaskPreview[];
};

export function SessionWorkspace({ session, notes, practiceTasks }: SessionWorkspaceProps) {
  const [isZenMode, setIsZenMode] = useState(false);
  const { t } = useTranslation();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  
  // Timer state
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Step Wizard Tab state
  const [activeTab, setActiveTab] = useState<"study" | "notes" | "practice" | "complete">("study");

  // Load timer status from localStorage on client-side mount
  useEffect(() => {
    if (session.status !== "in-progress") return;

    const storedIsPaused = localStorage.getItem(`ordo_session_is_paused_${session.id}`) === "true";
    const storedAccumulated = Number(localStorage.getItem(`ordo_session_accumulated_${session.id}`) || "0");
    const storedResumedAt = Number(localStorage.getItem(`ordo_session_resumed_at_${session.id}`) || "0");

    let currentElapsed = 0;
    if (storedIsPaused) {
      currentElapsed = storedAccumulated;
    } else {
      if (storedResumedAt > 0) {
        currentElapsed = storedAccumulated + Math.max(0, Math.floor((Date.now() - storedResumedAt) / 1000));
      } else {
        // First start: align with backend startedAt
        const start = new Date(session.startedAt).getTime();
        const now = Date.now();
        localStorage.setItem(`ordo_session_resumed_at_${session.id}`, String(now));
        localStorage.setItem(`ordo_session_accumulated_${session.id}`, String(Math.max(0, Math.floor((now - start) / 1000))));
        currentElapsed = Math.max(0, Math.floor((now - start) / 1000));
      }
    }

    queueMicrotask(() => {
      setIsPaused(storedIsPaused);
      setElapsedSeconds(currentElapsed);
    });
  }, [session.id, session.status, session.startedAt]);

  // Tick the timer
  useEffect(() => {
    if (session.status !== "in-progress" || isPaused || !mounted) return;

    const interval = setInterval(() => {
      const storedAccumulated = Number(localStorage.getItem(`ordo_session_accumulated_${session.id}`) || "0");
      const storedResumedAt = Number(localStorage.getItem(`ordo_session_resumed_at_${session.id}`) || "0");
      if (storedResumedAt > 0) {
        const currentElapsed = storedAccumulated + Math.max(0, Math.floor((Date.now() - storedResumedAt) / 1000));
        setElapsedSeconds(currentElapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.id, session.status, isPaused, mounted]);

  const handlePause = () => {
    const now = Date.now();
    const storedAccumulated = Number(localStorage.getItem(`ordo_session_accumulated_${session.id}`) || "0");
    const storedResumedAt = Number(localStorage.getItem(`ordo_session_resumed_at_${session.id}`) || "0");
    
    let currentElapsed = storedAccumulated;
    if (storedResumedAt > 0) {
      currentElapsed += Math.max(0, Math.floor((now - storedResumedAt) / 1000));
    }

    localStorage.setItem(`ordo_session_is_paused_${session.id}`, "true");
    localStorage.setItem(`ordo_session_accumulated_${session.id}`, String(currentElapsed));
    localStorage.setItem(`ordo_session_resumed_at_${session.id}`, "0");
    
    setIsPaused(true);
    setElapsedSeconds(currentElapsed);
  };

  const handleResume = () => {
    const now = Date.now();
    localStorage.setItem(`ordo_session_is_paused_${session.id}`, "false");
    localStorage.setItem(`ordo_session_resumed_at_${session.id}`, String(now));
    
    setIsPaused(false);
  };

  const formatStopwatch = (totalSeconds: number) => {
    if (totalSeconds >= 3600) {
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      const pad = (num: number) => String(num).padStart(2, "0");
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    } else {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      const pad = (num: number) => String(num).padStart(2, "0");
      return `${pad(mins)}:${pad(secs)}`;
    }
  };

  // Recalculate milestones using the official rules
  const completion = useMemo(() => {
    const totalSessions = session.status === "completed" ? 1 : 0;
    const docCount = notes.length;
    const resCount = session.resources.length;
    const practiceAttempts = practiceTasks.reduce((sum, t) => sum + (t.attemptSummary?.total ?? 0), 0);
    const successfulPracticeAttempts = practiceTasks.reduce((sum, t) => sum + (t.attemptSummary?.successful ?? 0), 0);
    const blockedPracticeAttempts = practiceTasks.reduce((sum, t) => {
      const result = t.attemptSummary?.latestResult;
      return sum + (result === "failed" || result === "partial" ? 1 : 0);
    }, 0);

    return deriveTopicCompletion({
      completedSessions: totalSessions,
      knowledgeDocuments: docCount,
      resources: resCount,
      practiceAttempts,
      successfulPracticeAttempts,
      blockedPracticeAttempts,
      hasActiveSession: session.status === "in-progress",
    });
  }, [session.status, session.resources.length, notes, practiceTasks]);

  const tabs = [
    { id: "study", label: t("sessions.stepStudy"), index: 1 },
    { id: "notes", label: t("sessions.stepNotes"), index: 2 },
    { id: "practice", label: t("sessions.stepPractice"), index: 3 },
    { id: "complete", label: t("sessions.stepComplete"), index: 4 }
  ] as const;

  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  const renderStepContent = () => {
    return (
      <div className="min-h-[350px]">
        {/* Step 1: Study Materials */}
        {activeTab === "study" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("sessions.studyMilestone")}
                </h3>
              </div>
              <SessionResources resources={session.resources} topicId={session.topicId} />
            </section>
            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setActiveTab("notes")} 
                className="gap-2 font-bold h-10 px-5 rounded-lg shadow-sm"
              >
                <span>{t("sessions.stepNotes")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Capture Notes */}
        {activeTab === "notes" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("sessions.notesMilestone")}
                </h3>
              </div>
              <SessionNotes
                placeholder={session.notesPlaceholder || "No notes captured yet."}
                notes={notes}
                topicId={session.topicId}
              />
            </section>
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("study")} 
                className="gap-2 font-bold h-10 px-5 rounded-lg border-border/40"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("sessions.stepStudy")}</span>
              </Button>
              <Button 
                onClick={() => setActiveTab("practice")} 
                className="gap-2 font-bold h-10 px-5 rounded-lg shadow-sm"
              >
                <span>{t("sessions.stepPractice")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Deliberate Practice */}
        {activeTab === "practice" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("sessions.practiceMilestone")}
                </h3>
              </div>
              <SessionPractice
                practice={session.practice}
                tasks={practiceTasks}
                topicId={session.topicId}
              />
            </section>
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("notes")} 
                className="gap-2 font-bold h-10 px-5 rounded-lg border-border/40"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("sessions.stepNotes")}</span>
              </Button>
              <Button 
                onClick={() => setActiveTab("complete")} 
                className="gap-2 font-bold h-10 px-5 rounded-lg shadow-sm"
              >
                <span>{t("sessions.stepComplete")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Complete Session */}
        {activeTab === "complete" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("sessions.completeMilestone")}
                </h3>
              </div>
              <Card className="rounded-lg border border-border/70 bg-card/85 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="text-sm font-bold text-foreground">
                      {session.status === "completed" ? t("common.completed") : t("sessions.exitFocus")}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {t("sessions.progressTracksFocus")}
                    </p>
                    {mounted && (
                      <p className="text-xs text-primary font-semibold mt-1">
                        {t("sessions.duration")}: {formatStopwatch(elapsedSeconds)}
                      </p>
                    )}
                  </div>
                  {session.status === "in-progress" && (
                    <div className="flex items-center gap-3">
                      <DiscardSessionForm sessionId={session.id} />
                      <FinishSessionForm
                        sessionId={session.id}
                        durationMinutes={durationMinutes}
                        disabled={false}
                        variant="default"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </section>
            <div className="flex justify-start pt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("practice")} 
                className="gap-2 font-bold h-10 px-5 rounded-lg border-border/40"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("sessions.stepPractice")}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabsBar = () => {
    return (
      <div className="border-b border-border/40 pb-px">
        <div className="flex flex-wrap gap-2 sm:gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative pb-3 text-sm font-semibold transition-all hover:text-foreground outline-none cursor-pointer",
                  isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold transition-all",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    {tab.index}
                  </span>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto px-6 py-8 md:px-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Zen Header Row */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary animate-pulse" />
              <div>
                <h1 className="text-lg font-bold text-foreground">{session.topic}</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{session.path}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && session.status === "in-progress" && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono font-extrabold text-primary shrink-0">
                  <Clock3 className="h-4 w-4" />
                  <span>{formatStopwatch(elapsedSeconds)}</span>
                  <div className="h-4 w-px bg-primary/20 mx-1" />
                  <button
                    type="button"
                    className="hover:scale-110 transition-transform focus:outline-none"
                    onClick={isPaused ? handleResume : handlePause}
                    title={isPaused ? t("sessions.resume") : t("sessions.pause")}
                  >
                    {isPaused ? <Play className="h-4 w-4 text-green-500 fill-green-500/20" /> : <Pause className="h-4 w-4 text-primary" />}
                  </button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsZenMode(false)}
                className="gap-2 border-border/55 text-xs font-semibold rounded-lg h-8 px-3 hover:bg-secondary/40"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                {t("sessions.exitFocus")}
              </Button>
            </div>
          </div>

          {/* Zen Content Workspace */}
          <div className="space-y-6">
            {renderTabsBar()}
            {renderStepContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-[1400px] mx-auto px-4">
      {/* Session Top Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/sessions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>{t("common.back")}</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsZenMode(true)}
            className="gap-2 border-border/50 text-xs font-bold rounded-lg hover:bg-secondary/40 h-8"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            {t("sessions.zenFocus")}
          </Button>
        </div>
      </div>

      {/* Main Grid Layout: Left Workspace, Right Control Panel */}
      <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-3">
        {/* Left Column: Workspace Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header topic title on the workspace itself */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase leading-none tracking-wider text-primary/80">
              {t("sessions.activeSession")}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {session.topic}
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{session.path}</p>
          </div>

          {renderTabsBar()}
          {renderStepContent()}
        </div>

        {/* Right Column: Sticky Control Center & Progress */}
        <div className="space-y-6 lg:sticky lg:top-6">
          
          {/* Active Stopwatch Card */}
          <Card className="rounded-xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
            <div className="space-y-1 pb-1 border-b border-border/10">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("sessions.activeSession")}
              </h3>
            </div>

            {mounted && session.status === "in-progress" && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/35 border border-border/20">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-mono font-extrabold text-lg text-foreground tracking-tight">
                    {formatStopwatch(elapsedSeconds)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 gap-1.5 text-xs font-bold rounded-lg border-border/40"
                  onClick={isPaused ? handleResume : handlePause}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5 fill-green-500/20 text-green-500" /> : <Pause className="h-3.5 w-3.5 text-primary" />}
                  <span>{isPaused ? t("sessions.resume") : t("sessions.pause")}</span>
                </Button>
              </div>
            )}

            {session.status === "in-progress" && (
              <div className="flex items-center justify-between pt-3 border-t border-border/10 gap-2">
                <DiscardSessionForm sessionId={session.id} />
                <FinishSessionForm
                  sessionId={session.id}
                  durationMinutes={durationMinutes}
                  disabled={false}
                  variant="default"
                />
              </div>
            )}
          </Card>

          {/* Milestone Checklist Card */}
          <Card className="rounded-xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("sessions.milestonesProgress")}
              </h3>
              <p className="text-xs text-muted-foreground/80 font-medium">
                {t(getTopicLearningStateLabel(completion.state))} &bull; {completion.percentage}%
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-secondary/55 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>

            {/* Checklist signals */}
            <div className="space-y-2 pt-2">
              {completion.signals.map((signal) => (
                <div 
                  key={signal.key} 
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-semibold transition-colors",
                    signal.complete
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : "bg-secondary/10 border-border/30 text-muted-foreground"
                  )}
                >
                  {signal.complete ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className="truncate">{signal.label}</span>
                </div>
              ))}
            </div>

            {/* Action guidance box */}
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/[0.02] p-4 text-xs">
              <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-foreground uppercase text-[9px] tracking-wider">
                  {t("sessions.whatShouldIDoNext")}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {completion.nextRequirement}
                </p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
