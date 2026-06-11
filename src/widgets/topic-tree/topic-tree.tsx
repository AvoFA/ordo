"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Milestone, Radio, ChevronDown, ChevronRight } from "lucide-react";
import type { TopicPreview, TopicSection } from "@/entities/topic/model/topic";
import { cn } from "@/shared/lib/utils";
import { StatusBadge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type TopicTreeProps = {
  sections: TopicSection[];
  activeTopicId: string;
  onSelectTopic: (topic: TopicPreview) => void;
  highlightedTopicId?: string | null;
};

export function TopicTree({ sections, activeTopicId, onSelectTopic, highlightedTopicId }: TopicTreeProps) {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const sectionWithActive = sections.find((section) =>
      section.topics.some((topic) => topic.id === activeTopicId),
    );

    return sectionWithActive ? { [sectionWithActive.id]: true } : {};
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <Card className="rounded-xl border border-border/40 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 gap-0">
      <CardHeader className="p-0 pb-4 border-b border-border/30 mb-5">
        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground font-semibold">
          <Milestone aria-hidden="true" className="h-4 w-4 text-primary" />
          {t("paths.learningRoadmap")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {sections.map((section, sectionIndex) => {
          const isExpanded = !!expandedSections[section.id];
          const topicCount = section.topicCount ?? section.topics.length;
          const completedCount =
            section.completedCount ??
            section.topics.filter((topic) => topic.status === "completed").length;
          const readyCount = section.readyCount ?? 0;

          return (
            <section key={section.id} className="space-y-4">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between gap-4 bg-secondary/15 px-4 py-2.5 rounded-xl border border-border/20 hover:bg-secondary/25 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-primary/70 bg-primary/10 px-2 py-0.5 rounded-md tracking-wider">
                    0{sectionIndex + 1}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-foreground leading-none">{section.title}</h2>
                    <p className="text-[9px] text-muted-foreground/75 font-bold uppercase tracking-wider mt-1.5 leading-none">
                      {completedCount}/{topicCount} {t("common.completed").toLowerCase()}
                      {readyCount > 0 ? ` / ${readyCount} ${t("common.readyToStart").toLowerCase()}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-1 w-20 rounded-full bg-secondary/55 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${section.progress}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-1.5 border-l-2 border-border/25 pl-5 ml-4 pb-2 pt-1">
                  {section.topics.map((topic) => {
                    const isActive = topic.id === activeTopicId;
                    const isCompleted = topic.status === "completed";
                    const isInProgress = topic.status === "in-progress";
                    const isHighlighted = topic.id === highlightedTopicId;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        className={cn(
                          "w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-all duration-150 border relative",
                          "hover:bg-secondary/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                          isActive
                            ? "border-l-[3px] border-primary border-t-primary/15 border-r-primary/15 border-b-primary/15 bg-primary/5 shadow-sm"
                            : "border-transparent bg-transparent",
                          isHighlighted && "animate-brief-highlight",
                        )}
                        onClick={() => onSelectTopic(topic)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="mt-0.5 text-xs font-semibold shrink-0 select-none w-4 text-center">
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                              ) : (isInProgress || isActive) ? (
                                <Radio className="h-4 w-4 text-primary" aria-hidden="true" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
                              )}
                            </span>

                            <div className="min-w-0">
                              <div
                                className={cn(
                                  "text-sm font-semibold transition-colors leading-snug",
                                  isActive
                                    ? "text-primary"
                                    : isCompleted
                                      ? "text-muted-foreground font-medium"
                                      : "text-foreground",
                                )}
                              >
                                {topic.title}
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {topic.estimatedMinutes ? `${topic.estimatedMinutes} ${t("practice.minutesUnit")}` : t("practice.notEstimated")}
                                {topic.completion ? (
                                  <>
                                    {" "}
                                    / {topic.completion.completedCount}/{topic.completion.checklistTotal} {t("paths.learningMilestones")}
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center justify-end">
                            <StatusBadge status={topic.status} className="text-[10px] font-normal" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
