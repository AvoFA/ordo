"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import type { LearningPathDetail } from "@/entities/learning-path/model/learning-path";
import { useUiStore } from "@/shared/model/ui-store";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { EditLearningPathForm } from "@/features/learning-paths/ui/edit-learning-path-form";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type PathHeaderProps = {
  learningPath: LearningPathDetail;
};

export function PathHeader({ learningPath }: PathHeaderProps) {
  const { isEditMode } = useUiStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { t } = useTranslation();
  const completedTopicCount =
    learningPath.completedTopicCount ??
    Math.round((learningPath.progress / 100) * learningPath.topicCount);
  const readyTopicCount = learningPath.readyTopicCount ?? 0;

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2">
        <Link
          href="/learning-paths"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>{t("common.back")}</span>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-primary">
            {t("paths.eyebrow")}
          </p>
          <h1 className="text-[32px] font-semibold leading-tight text-foreground">
            {learningPath.title}
          </h1>
          {learningPath.description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {learningPath.description}
            </p>
          ) : (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/50 italic">
              {t("paths.emptyDescriptionPlaceholder")}
            </p>
          )}
        </div>

        {isEditMode && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/60 rounded-lg h-9"
                title="Edit path details"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{t("common.configure")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-6">
              <div className="space-y-1 mb-4">
                <DialogTitle className="text-lg font-bold">{t("common.configure")}</DialogTitle>
                <DialogDescription className="text-xs">
                  Modify title, description, or delete this entire learning path.
                </DialogDescription>
              </div>
              <EditLearningPathForm
                pathId={learningPath.id}
                initialTitle={learningPath.title}
                initialDescription={learningPath.description}
                onSuccess={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-semibold">
        <div className="flex items-center gap-1.5">
          {t("paths.completedTopicsOf", {
            completed: completedTopicCount,
            total: learningPath.topicCount,
          })}
        </div>
        <span className="opacity-40">&bull;</span>
        <div>{t("paths.readyForReview", { count: readyTopicCount })}</div>
      </div>
    </div>
  );
}
