"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import {
  Clock,
  CheckCircle2,
  Play,
} from "lucide-react";
import Link from "next/link";
import {
  mockLearningSummary,
  mockWeeklyRhythm,
  mockPathProgress,
  mockPracticeStats,
  mockLearningContinuity,
} from "@/entities/analytics/model/mock-analytics";

export function AnalyticsOverview() {
  const { t } = useTranslation();
  // Find max value in weekly rhythm to scale heights correctly
  const maxWeeklyHours = Math.max(...mockWeeklyRhythm.map((d) => d.hours)) || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-foreground/90">

      {/* 1. Learning Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border/40 rounded-xl p-5 flex items-start justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">{t("analytics.studyTime")}</span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{mockLearningSummary.totalHours}h</h3>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">{t("analytics.totalFocusedHours")}</p>
          </div>
          <div className="p-2 bg-secondary/40 rounded-lg text-muted-foreground">
            <Clock size={16} />
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-xl p-5 flex items-start justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">{t("analytics.learnedTopics")}</span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{mockLearningSummary.completedTopicsCount}</h3>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">{t("analytics.topicsLearned")}</p>
          </div>
          <div className="p-2 bg-secondary/40 rounded-lg text-muted-foreground">
            <CheckCircle2 size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Weekly Rhythm Chart */}
        <div className="bg-card/40 border border-border/30 rounded-xl p-5 lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">{t("analytics.weeklyRhythm")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("analytics.weeklyDesc")}
            </p>
          </div>

          <div className="h-48 flex items-end justify-between pt-6 px-4">
            {mockWeeklyRhythm.map((day) => {
              const heightPercent = maxWeeklyHours > 0 ? (day.hours / maxWeeklyHours) * 100 : 0;
              return (
                <div key={day.dayName} className="flex flex-col items-center group w-10">
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                    {day.label}
                  </span>
                  <div className="w-6 bg-secondary/35 rounded-t-sm h-32 flex items-end">
                    <div
                      className="w-full bg-primary/80 hover:bg-primary transition-colors rounded-t-sm"
                      style={{ height: `${heightPercent || 2}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 font-medium">{day.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Learning Continuity & Practice Stats */}
        <div className="space-y-6">
          {/* Continuity Box */}
          <div className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("analytics.whatToContinue")}</h4>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-foreground/90">
                Last studied <strong className="text-foreground font-medium">{mockLearningContinuity.lastStudiedTopic}</strong> in <span className="text-muted-foreground">{mockLearningContinuity.pathTitle}</span> ({mockLearningContinuity.timeAgo}).
              </p>
              <div className="p-3 bg-secondary/30 border border-border/20 rounded-lg text-xs text-muted-foreground space-y-2">
                <span className="font-semibold block text-[10px] text-muted-foreground/75 uppercase">{t("analytics.recommendedNext")}</span>
                <span className="block">{mockLearningContinuity.nextRecommendedStep}</span>
              </div>
            </div>

            <Link
              href="/sessions"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-medium py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              <span>{t("analytics.continueSession")}</span>
            </Link>
          </div>

          {/* Practice Summary */}
          <div className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">{t("analytics.practiceReview")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("analytics.practiceReviewDesc")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-border/30 rounded-lg p-2.5 bg-secondary/15">
                <span className="text-muted-foreground/75 block text-[10px]">{t("analytics.inProgress")}</span>
                <span className="text-lg font-bold text-foreground mt-1 block">{mockPracticeStats.inProgress}</span>
              </div>
              <div className="border border-border/30 rounded-lg p-2.5 bg-secondary/15">
                <span className="text-muted-foreground/75 block text-[10px]">{t("analytics.todo")}</span>
                <span className="text-lg font-bold text-foreground mt-1 block">{mockPracticeStats.todo}</span>
              </div>
              <div className="border border-border/30 rounded-lg p-2.5 bg-secondary/15">
                <span className="text-muted-foreground/75 block text-[10px]">{t("common.completed")}</span>
                <span className="text-lg font-bold text-foreground mt-1 block">{mockPracticeStats.completed}</span>
              </div>
              <div className="border border-border/30 rounded-lg p-2.5 bg-secondary/15">
                <span className="text-muted-foreground/75 block text-[10px]">{t("analytics.reviewLater")}</span>
                <span className="text-lg font-bold text-foreground mt-1 block">{mockPracticeStats.reviewLater}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Path Progress Tree */}
      <div className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">{t("analytics.learningPathProgress")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("analytics.pathProgressDesc")}
          </p>
        </div>

        <div className="space-y-4">
          {mockPathProgress.map((path) => (
            <div key={path.id} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">{path.title}</span>
                <span className="text-muted-foreground">
                  {path.completedTopics} / {path.totalTopics} {t("paths.topicsCount", { count: path.totalTopics }).replace(/[0-9\s]+/g, "")} ({path.percentage}%)
                </span>
              </div>
              <div className="w-full bg-secondary/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${path.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AnalyticsOverview;
