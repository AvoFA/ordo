"use client";

import { useState, useMemo } from "react";
import type { LearningPathPreview } from "@/entities/learning-path/model/learning-path";
import { LearningPathCard } from "@/entities/learning-path/ui/learning-path-card";
import { ActivePathCard } from "@/entities/learning-path/ui/active-path-card";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { CreateLearningPathForm } from "@/features/learning-paths/ui/create-learning-path-form";
import { EmptyState } from "@/widgets/empty-state/empty-state";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Plus, Search } from "lucide-react";

type LearningPathsOverviewProps = {
  learningPaths: LearningPathPreview[];
};

export function LearningPathsOverview({ learningPaths }: LearningPathsOverviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "in-progress" | "completed">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "progress">("recent");
  const { t } = useTranslation();

  // Filtered and sorted learning paths list
  const processedPaths = useMemo(() => {
    let result = [...learningPaths];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((p) => p.status === "learning" || p.status === "needs-review");
    } else if (statusFilter === "in-progress") {
      result = result.filter((p) => p.progress > 0 && p.progress < 100);
    } else if (statusFilter === "completed") {
      result = result.filter((p) => p.progress === 100 && p.topicCount > 0);
    }

    // Sort options
    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "progress") {
      result.sort((a, b) => b.progress - a.progress);
    }

    return result;
  }, [learningPaths, searchQuery, statusFilter, sortBy]);

  // Priority: Active / Continue Learning paths (learning/needs-review or 0 < progress < 100). Show top 3.
  const continueLearningPaths = useMemo(() => {
    return learningPaths
      .filter((p) => p.status === "learning" || p.status === "needs-review" || (p.progress > 0 && p.progress < 100))
      .slice(0, 3);
  }, [learningPaths]);

  const hasActiveSearchOrFilter = searchQuery.trim().length > 0 || statusFilter !== "all" || sortBy !== "recent";

  // Filter out the active paths from the main grid to prevent duplication when no search/filter is active
  const mainGridPaths = useMemo(() => {
    if (hasActiveSearchOrFilter) {
      return processedPaths;
    }
    const continueIds = new Set(continueLearningPaths.map(p => p.id));
    return processedPaths.filter(p => !continueIds.has(p.id));
  }, [processedPaths, continueLearningPaths, hasActiveSearchOrFilter]);

  if (learningPaths.length === 0) {
    return (
      <EmptyState
        eyebrow={t("paths.eyebrow")}
        title={t("paths.title")}
        description={t("paths.subtitle")}
        emptyTitle="No learning paths yet."
        emptyDescription="Create your first structured learning path to begin organizing your education."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            A learning path represents a broad subject or course (e.g., Frontend Engineering). 
            We recommend keeping active paths to a minimum and organizing specific lessons, 
            readings, and exercises as topics inside them.
          </p>
          <div className="rounded-lg border border-border/70 bg-secondary/25 p-4">
            <CreateLearningPathForm />
          </div>
        </div>
      </EmptyState>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header: title + create button */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-1">
          <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-primary/75">
            {t("paths.eyebrow")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("paths.title")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("paths.subtitle")}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start gap-2 rounded-xl shadow-sm hover:-translate-y-px transition-transform duration-200 md:self-auto">
              <Plus className="h-4 w-4" />
              {t("paths.newPathBtn")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-6">
            <div className="space-y-1 mb-4">
              <DialogTitle className="text-lg font-bold">{t("paths.newPathBtn")}</DialogTitle>
              <DialogDescription className="text-xs">
                A learning path is a broad subject. We encourage keeping active paths limited to help you focus, and adding topics inside them for specific lessons.
              </DialogDescription>
            </div>
            <CreateLearningPathForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </section>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-border/40 bg-card/40 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            type="text"
            placeholder={t("paths.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filters */}
          <div className="flex rounded-lg border border-border/50 bg-secondary/10 p-0.5">
            {(["all", "active", "in-progress", "completed"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === filter
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                {filter === "all" ? t("paths.filterAll") :
                 filter === "active" ? t("paths.filterActive") :
                 filter === "in-progress" ? t("paths.filterInProgress") :
                 t("paths.filterCompleted")}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("paths.sortByLabel")}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "name" | "progress")}
              className="rounded-lg border border-border/50 bg-background px-2.5 py-1 text-xs font-semibold text-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary/40 h-8"
            >
              <option value="recent">{t("paths.sortRecent")}</option>
              <option value="name">{t("paths.sortName")}</option>
              <option value="progress">{t("paths.sortProgress")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Priority: Continue Learning Section (only when no search/filters are active) */}
      {!hasActiveSearchOrFilter && continueLearningPaths.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/85">
            {t("paths.continueLearningSection")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {continueLearningPaths.map((path) => (
              <ActivePathCard key={`priority-${path.id}`} learningPath={path} />
            ))}
          </div>
        </section>
      )}

      {/* Main Grid: All Learning Paths */}
      <section className="space-y-3">
        {hasActiveSearchOrFilter ? (
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/85">
            {t("paths.searchResultsSection", { count: mainGridPaths.length })}
          </h3>
        ) : (
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/85">
            {t("paths.allPathsSection")}
          </h3>
        )}

        {mainGridPaths.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mainGridPaths.map((learningPath) => (
              <LearningPathCard key={learningPath.id} learningPath={learningPath} />
            ))}
          </div>
        ) : (
          <Card className="rounded-xl border border-dashed border-border/50 bg-card/30">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                {t("paths.noPathsFound")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {t("paths.noPathsFoundSub")}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
