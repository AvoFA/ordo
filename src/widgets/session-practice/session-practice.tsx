"use client";

import { useState } from "react";
import { updatePracticeTaskStatusAction } from "@/features/practice/actions/practice.actions";
import type { PracticeTaskPreview } from "@/entities/practice-task/model/practice-task";
import { PracticeTaskCard } from "@/entities/practice-task/ui/practice-task-card";
import { Target, Plus } from "lucide-react";
import { CreatePracticeTaskForm } from "@/features/practice/ui/create-practice-task-form";
import { RecordPracticeAttemptForm } from "@/features/practice/ui/record-practice-attempt-form";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { useUiStore } from "@/shared/model/ui-store";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { cn } from "@/shared/lib/utils";

type SessionPracticeProps = {
  practice: string[];
  tasks: PracticeTaskPreview[];
  topicId: string | null;
};

export function SessionPractice({ practice, tasks, topicId }: SessionPracticeProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    tasks && tasks.length > 0 ? tasks[0].id : null
  );
  const { isEditMode } = useUiStore();
  const { t } = useTranslation();
  
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});
  const toggleItem = (idx: number) => {
    setCompletedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  return (
    <Card className="rounded-lg border-border/70 bg-card/85 shadow-none">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target aria-hidden="true" className="h-4 w-4 text-primary" />
          {t("nav.practice")}
        </CardTitle>
        {isEditMode && topicId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" className="h-7 w-7 rounded-md hover:bg-secondary/40 text-muted-foreground hover:text-foreground">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-6">
              <div className="space-y-1 mb-4">
                <DialogTitle className="text-lg font-bold">{t("practice.dialogTitle")}</DialogTitle>
                <DialogDescription className="text-xs">
                  {t("practice.dialogDesc")}
                </DialogDescription>
              </div>
              <CreatePracticeTaskForm topicId={topicId} compact={true} />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length > 1 && (
          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-secondary/25 border border-border/20 mb-2">
            {tasks.map((task, idx) => {
              const isActive = task.id === activeTask?.id;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setActiveTaskId(task.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer select-none",
                    isActive
                      ? "bg-card text-primary shadow-sm border-border/20 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/10",
                  )}
                >
                  <span className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                    isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[120px]">{task.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeTask ? (
          <>
            <PracticeTaskCard task={activeTask} variant="compact" />
            
            {/* Attempts progress & timeline */}
            {(() => {
              const summary = activeTask.attemptSummary;
              if (!summary || summary.total === 0) return null;
              return (
                <div className="rounded-xl border border-border/35 bg-card/65 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>{t("practice.learningEvidence") || "Прогрес спроб"}</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[10px]">
                      {summary.successful} / {summary.total} {t("practice.successAttempts") || "успішно"}
                    </span>
                  </div>
                  
                  {/* Visual mini-timeline */}
                  <div className="flex gap-1.5 h-2 rounded-full overflow-hidden bg-secondary/50 w-full">
                    {Array.from({ length: summary.total }).map((_, i) => {
                      const isSuccess = i < summary.successful;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-full rounded-full transition-all",
                            isSuccess 
                              ? "bg-emerald-500 shadow-sm shadow-emerald-500/10" 
                              : "bg-amber-500/80"
                          )}
                          title={isSuccess ? "Успішна спроба" : "Потрібно повторити"}
                        />
                      );
                    })}
                  </div>

                  {summary.latestResult && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground font-semibold">Остання спроба:</span>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border",
                        summary.latestResult === "success" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                          : summary.latestResult === "partial"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                      )}>
                        {summary.latestResult === "success" && "Успішно"}
                        {summary.latestResult === "partial" && "Частково"}
                        {summary.latestResult === "failed" && "Провалено"}
                      </span>
                    </div>
                  )}

                  {summary.latestReflection && (
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-2">
                      &ldquo;{summary.latestReflection}&rdquo;
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="rounded-lg border border-border/40 bg-secondary/25 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t("practice.instruction")}
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground">{activeTask.instruction}</p>
            </div>
            <RecordPracticeAttemptForm taskId={activeTask.id} />
          </>
        ) : (
          <div className="space-y-2">
            {practice.map((item, index) => {
              const isDone = completedItems[index];
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(index)}
                  className={cn(
                    "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer select-none",
                    isDone 
                      ? "bg-primary/[0.02] border-primary/20 text-muted-foreground/80 line-through decoration-muted-foreground/30" 
                      : "bg-secondary/20 border-border/40 text-foreground hover:border-border/80 hover:bg-secondary/35"
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold transition-all",
                    isDone 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-border/60 bg-background text-muted-foreground/45"
                  )}>
                    {isDone ? "✓" : index + 1}
                  </span>
                  <p className="text-xs leading-normal font-semibold mt-0.5">{item}</p>
                </button>
              );
            })}
          </div>
        )}

        {activeTask && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {activeTask.status !== "in-progress" && activeTask.status !== "completed" && (
              <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
                <input type="hidden" name="taskId" value={activeTask.id} />
                <input type="hidden" name="status" value="in-progress" />
                <Button type="submit" variant="secondary" size="sm" className="border border-border/60 rounded-lg">
                  {t("practice.actionStart")}
                </Button>
              </form>
            )}
            {activeTask.status !== "completed" && (
              <form action={async (formData) => { await updatePracticeTaskStatusAction({}, formData); }}>
                <input type="hidden" name="taskId" value={activeTask.id} />
                <input type="hidden" name="status" value="completed" />
                <Button type="submit" variant="outline" size="sm" className="rounded-lg">
                  {t("practice.actionMarkDone")}
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
