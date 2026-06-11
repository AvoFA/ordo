"use client";

import { useUiStore } from "@/shared/model/ui-store";
import { Edit2, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

export function EditModeToggle() {
  const { isEditMode, setEditMode } = useUiStore();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => setEditMode(!isEditMode)}
      className={cn(
        "h-8 flex items-center gap-1.5 px-3 rounded-md border text-xs font-semibold select-none cursor-pointer transition-all duration-200 outline-none",
        isEditMode
          ? "bg-primary/10 text-primary border-primary/30 shadow-xs hover:bg-primary/15"
          : "bg-secondary/45 text-muted-foreground border-border/60 hover:bg-secondary hover:text-foreground"
      )}
      title={
        isEditMode
          ? t("common.editMode") + ": Manage structure, edit topics/paths/tasks"
          : t("common.studyMode") + ": Focus on learning, sessions, and practice"
      }
    >
      {isEditMode ? (
        <>
          <Edit2 className="h-3.5 w-3.5" />
          <span>{t("common.editMode")}</span>
        </>
      ) : (
        <>
          <BookOpen className="h-3.5 w-3.5" />
          <span>{t("common.studyMode")}</span>
        </>
      )}
    </button>
  );
}
