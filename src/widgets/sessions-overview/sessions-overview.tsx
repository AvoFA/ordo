"use client";

import Link from "next/link";
import type { LearningSession } from "@/entities/session/model/session";
import { Badge, StatusBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/widgets/empty-state/empty-state";
import { BookOpen, ArrowRight, Layers } from "lucide-react";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type SessionsOverviewProps = {
  activeSession: LearningSession | null;
  recentSessions: LearningSession[];
};

export function SessionsOverview({ activeSession, recentSessions }: SessionsOverviewProps) {
  const { t } = useTranslation();

  if (recentSessions.length === 0) {
    return (
      <EmptyState
        eyebrow="Deep Work"
        title={t("sessions.title")}
        description={t("sessions.progressTracksFocus")}
        emptyTitle={t("sessions.title")}
        emptyDescription={t("nav.sidebarNoActiveDesc")}
      >
        <Button asChild>
          <Link href="/learning-paths">{t("nav.browsePaths")}</Link>
        </Button>
      </EmptyState>
    );
  }

  const completedCount = recentSessions.filter((s) => s.status === "completed").length;
  const inProgressCount = recentSessions.filter((s) => s.status === "in-progress").length;

  return (
    <div className="w-full space-y-8 max-w-7xl mx-auto">
      {/* Active Session Hero — only shown when a session is running */}
      {activeSession && (
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-primary/60 before:to-transparent">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                {t("sessions.activeSession")}
              </span>
              <h2 className="text-xl font-bold leading-tight text-foreground">{activeSession.topic}</h2>
              <p className="text-xs font-semibold text-muted-foreground/80">{activeSession.path}</p>
              {activeSession.description && (
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground pt-1">
                  {activeSession.description}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="metadata" className="text-[10px]">{activeSession.startedAtLabel}</Badge>
                <Badge variant="metadata" className="text-[10px]">{activeSession.estimatedTime}</Badge>
              </div>
              <Button asChild className="gap-2 rounded-xl shadow-sm hover:-translate-y-px transition-transform">
                <Link href={`/sessions/${activeSession.id}`}>
                  {t("today.continueSessionBtn")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main grid: recent session log + insights sidebar */}
      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Session Log */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/20 pb-3">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("sessions.learningHistory")}
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground/60">
              {recentSessions.length} {t("sessions.title").toLowerCase()}
            </span>
          </div>

          <div className="space-y-2">
            {recentSessions.map((session) => (
              <Card
                key={session.id}
                className="rounded-xl border-border/30 bg-card/70 shadow-none transition-colors hover:border-border/60 hover:bg-card"
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground leading-snug">{session.topic}</div>
                    <div className="text-[11px] font-medium text-muted-foreground/80">{session.path}</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <StatusBadge status={session.status} />
                      <Badge variant="metadata" className="text-[10px]">
                        {session.startedAtLabel}
                      </Badge>
                      {session.finishedAtLabel && (
                        <Badge variant="metadata" className="text-[10px]">
                          {session.finishedAtLabel}
                        </Badge>
                      )}
                      {session.resources.length > 0 && (
                        <Badge variant="metadata" className="text-[10px]">
                          {t("sessions.outputResource", { count: session.resources.length })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="shrink-0 border border-border/50 text-xs rounded-lg"
                  >
                    <Link href={`/sessions/${session.id}`}>{t("common.edit")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Insights Sidebar */}
        <aside className="space-y-4">
          <Card className="rounded-xl border-border/30 bg-card/60 p-5 shadow-none gap-0">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3 mb-4">
              <Layers className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("sessions.sessionInsights")}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">{t("sessions.title")}</span>
                <span className="text-sm font-bold text-foreground">{recentSessions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">{t("common.completed")}</span>
                <span className="text-sm font-bold text-foreground">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">{t("common.inProgress")}</span>
                <span className="text-sm font-bold text-foreground">{inProgressCount}</span>
              </div>
            </div>
          </Card>

          <Button asChild variant="outline" className="w-full rounded-xl text-xs border-border/50 hover:bg-secondary/40">
            <Link href="/learning-paths">{t("nav.browsePaths")}</Link>
          </Button>
        </aside>
      </section>
    </div>
  );
}
