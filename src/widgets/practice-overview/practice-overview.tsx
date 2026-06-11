"use client";

import { useState } from "react";
import type {
  PracticeTaskPreview,
  PracticeTopicOption,
} from "@/entities/practice-task/model/practice-task";
import { PracticeTaskCard } from "@/entities/practice-task/ui/practice-task-card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CreatePracticeTaskForm } from "@/features/practice/ui/create-practice-task-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Plus, CheckSquare, RotateCcw, Target, ShieldCheck, Search, ChevronDown, Zap, Flame, Trophy } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type TabId = "needs-review" | "in-progress" | "secured";

const INITIAL_VISIBLE = 5;

type PracticeOverviewProps = {
  tasks: PracticeTaskPreview[];
  topicOptions: PracticeTopicOption[];
};

export function PracticeOverview({ tasks, topicOptions }: PracticeOverviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation();

  // Split by user mental model
  const needsReviewTasks = tasks.filter(
    (task) =>
      task.attemptSummary?.latestResult === "failed" ||
      task.attemptSummary?.latestResult === "partial"
  );

  const inProgressTasks = tasks.filter(
    (task) =>
      !needsReviewTasks.includes(task) &&
      (task.status === "in-progress" || task.status === "not-started")
  );

  const securedTasks = tasks.filter(
    (task) => task.status === "completed"
  );

  // Default tab: pick the one with tasks
  const defaultTab: TabId =
    needsReviewTasks.length > 0
      ? "needs-review"
      : inProgressTasks.length > 0
        ? "in-progress"
        : "secured";

  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  const tabs: {
    id: TabId;
    label: string;
    count: number;
    icon: React.ReactNode;
    activeClass: string;
  }[] = [
    {
      id: "needs-review",
      label: t("practice.needsReview"),
      count: needsReviewTasks.length,
      icon: <RotateCcw className="h-3.5 w-3.5 text-amber-500" />,
      activeClass: "bg-background border-border/40 text-foreground shadow-sm font-bold",
    },
    {
      id: "in-progress",
      label: t("practice.inProgress"),
      count: inProgressTasks.length,
      icon: <Target className="h-3.5 w-3.5 text-primary" />,
      activeClass: "bg-background border-border/40 text-foreground shadow-sm font-bold",
    },
    {
      id: "secured",
      label: t("practice.secured"),
      count: securedTasks.length,
      icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />,
      activeClass: "bg-background border-border/40 text-foreground shadow-sm font-bold",
    },
  ];

  const rawTaskList =
    activeTab === "needs-review"
      ? needsReviewTasks
      : activeTab === "in-progress"
        ? inProgressTasks
        : securedTasks;

  // Filter by search query
  const q = searchQuery.trim().toLowerCase();
  const filteredTasks = q
    ? rawTaskList.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.linkedTopic?.toLowerCase().includes(q)
      )
    : rawTaskList;

  // Slice for "show more" — only when not searching
  const visibleTasks = !q && !showAll ? filteredTasks.slice(0, INITIAL_VISIBLE) : filteredTasks;
  const hiddenCount = filteredTasks.length - visibleTasks.length;

  const [recommendedTask, ...secondaryTasks] = visibleTasks;
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "";
  const secondaryHeading =
    activeTab === "secured"
      ? t("practice.securedArchive")
      : activeTab === "needs-review"
        ? t("practice.moreReviewTasks", { count: secondaryTasks.length }).replace("{count}", String(secondaryTasks.length))
        : t("practice.moreActiveTasks", { count: secondaryTasks.length }).replace("{count}", String(secondaryTasks.length));

  const recommendationTheme = (() => {
    switch (activeTab) {
      case "needs-review":
        return {
          icon: <Flame className="h-4 w-4 animate-pulse text-amber-500" />,
          container: "border-border/40 bg-background text-foreground shadow-sm",
          desc: t("practice.recommendedReviewDesc"),
        };
      case "secured":
        return {
          icon: <Trophy className="h-4 w-4 text-emerald-500" />,
          container: "border-border/40 bg-background text-foreground shadow-sm",
          desc: t("practice.recommendedSecuredDesc"),
        };
      case "in-progress":
      default:
        return {
          icon: <Zap className="h-4 w-4 fill-primary/10 text-primary" />,
          container: "border-border/40 bg-background text-foreground shadow-sm",
          desc: t("practice.recommendedActiveDesc"),
        };
    }
  })();

  // Reset show-all and search when switching tabs
  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    setSearchQuery("");
    setShowAll(false);
  }

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("practice.title")}</h1>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground/90">
            {t("practice.subtitle")}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="self-start gap-2 shadow-sm rounded-xl hover:translate-y-[-1px] transition-transform duration-200"
            >
              <Plus className="h-4 w-4" />
              {t("practice.addBtn")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-6">
            <div className="space-y-1 mb-4">
              <DialogTitle className="text-lg font-bold">{t("practice.dialogTitle")}</DialogTitle>
              <DialogDescription className="text-xs">
                {t("practice.dialogDesc")}
              </DialogDescription>
            </div>
            <CreatePracticeTaskForm topicOptions={topicOptions} compact={true} />
          </DialogContent>
        </Dialog>
      </section>

      {tasks.length === 0 ? (
        <Card className="rounded-xl border border-dashed border-border/60 bg-card/30 shadow-none py-12">
          <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <CheckSquare className="h-8 w-8 text-muted-foreground/45" />
            <div className="text-sm font-semibold text-foreground/95">{t("practice.emptyTitle")}</div>
            <p className="max-w-md text-xs text-muted-foreground/80">{t("practice.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Segmented Tab Controller */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/20 border border-border/20">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer",
                    isActive
                      ? `${tab.activeClass} shadow-sm`
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                  ].join(" ")}
                >
                  <span className={isActive ? "" : "opacity-60"}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={[
                      "ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1",
                      isActive
                        ? "bg-current/15 opacity-100"
                        : "bg-secondary/60 text-muted-foreground",
                    ].join(" ")}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar — visible only when there are tasks */}
          {rawTaskList.length >= 4 && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowAll(false);
                }}
                placeholder={t("practice.searchPlaceholder")}
                className="pl-9 h-9 text-xs rounded-lg bg-secondary/20 border-border/30 focus-visible:bg-card"
              />
            </div>
          )}

          {/* Active Tab Content */}
          {filteredTasks.length === 0 ? (
            <Card className="rounded-xl border border-dashed border-border/40 bg-card/20 shadow-none py-10">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                {q ? (
                  <>
                    <Search className="h-5 w-5 text-muted-foreground/35" />
                    <p className="text-sm text-muted-foreground/70">
                      {t("practice.searchEmpty")}
                    </p>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-6 w-6 text-muted-foreground/35" />
                    <p className="text-sm text-muted-foreground/70">
                      {activeTab === "needs-review" && t("practice.emptyNeedsReview")}
                      {activeTab === "in-progress" && t("practice.emptyInProgress")}
                      {activeTab === "secured" && t("practice.emptySecured")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Recommended task */}
              {recommendedTask && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${recommendationTheme.container}`}>
                        {recommendationTheme.icon}
                      </span>
                      <div>
                        <h2 className="text-sm font-bold text-foreground">{t("practice.recommendedNow")}</h2>
                        <p className="text-[11px] text-muted-foreground">
                          {recommendationTheme.desc}
                        </p>
                      </div>
                    </div>
                    <span className="hidden rounded-full border border-border/40 bg-secondary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:inline-flex">
                      {activeTabLabel}
                    </span>
                  </div>
                  <PracticeTaskCard key={recommendedTask.id} task={recommendedTask} variant="recommended" />
                </section>
              )}

              {/* Remaining tasks */}
              {secondaryTasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/75">
                    {secondaryHeading}
                  </h3>
                  {secondaryTasks.map((task) => (
                    <PracticeTaskCard key={task.id} task={task} variant="compact" />
                  ))}
                </div>
              )}

              {/* Show more button */}
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-secondary/20 transition-all duration-150"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  {t("practice.showMore", { count: String(hiddenCount) }).replace("{count}", String(hiddenCount))}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
