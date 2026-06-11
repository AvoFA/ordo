"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { LearningPathDetail } from "@/entities/learning-path/model/learning-path";
import type { TopicParentOption } from "@/entities/topic/api/topics.repository";

import { CreateTopicForm } from "@/features/topics/ui/create-topic-form";
import { PathHeader } from "@/widgets/path-header/path-header";
import { TopicPreview as TopicPreviewPanel } from "@/widgets/topic-preview/topic-preview";
import { TopicTree } from "@/widgets/topic-tree/topic-tree";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { useUiStore } from "@/shared/model/ui-store";

type LearningPathWorkspaceProps = {
  learningPath: LearningPathDetail;
  parentOptions: TopicParentOption[];
};

function getInitialTopic(learningPath: LearningPathDetail) {
  return (
    learningPath.sections
      .flatMap((section) => section.topics)
      .find((topic) => topic.status === "in-progress") ?? learningPath.sections[0]?.topics[0]
  );
}

export function LearningPathWorkspace({ learningPath, parentOptions }: LearningPathWorkspaceProps) {
  const [activeTopicIdState, setActiveTopicIdState] = useState<string | undefined>(undefined);
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { isEditMode } = useUiStore();

  const allTopics = useMemo(() => {
    return learningPath.sections.flatMap((section) => section.topics);
  }, [learningPath.sections]);

  const initialTopic = useMemo(() => getInitialTopic(learningPath), [learningPath]);

  const activeTopic = useMemo(() => {
    const targetId = activeTopicIdState ?? initialTopic?.id;
    return allTopics.find((t) => t.id === targetId) ?? initialTopic;
  }, [allTopics, activeTopicIdState, initialTopic]);

  const handleTopicCreated = (topicId: string) => {
    setActiveTopicIdState(topicId);
    setHighlightedTopicId(topicId);
    setCreateOpen(false);
    setTimeout(() => {
      setHighlightedTopicId((current) => (current === topicId ? null : current));
    }, 3000);
  };

  if (!activeTopic) {
    return (
      <div className="w-full space-y-6">
        <PathHeader learningPath={learningPath} />
        <section className="rounded-lg border border-border/70 bg-card/85 p-6">
          <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-primary">
            Topic Tree
          </p>
          <h2 className="mt-3 text-xl font-semibold text-foreground">No topics yet.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Start by adding the first topic in this learning path. Topics are the specific modules or lessons you will work through.
          </p>
          <div className="mt-6 rounded-lg border border-border/70 bg-secondary/25 p-4">
            <CreateTopicForm
              pathId={learningPath.id}
              parentOptions={parentOptions}
              onSuccess={handleTopicCreated}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <PathHeader learningPath={learningPath} />
        {isEditMode && (
          <div className="shrink-0 md:pt-10">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-border/60 rounded-lg h-9">
                  <Plus className="h-3.5 w-3.5" />
                  New Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <div className="space-y-1 pb-2 border-b border-border/30">
                  <DialogTitle>Create Topic</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Add a root section or nested topic. Depth is limited to 3 levels.
                  </p>
                </div>
                <div className="pt-2">
                  <CreateTopicForm
                    pathId={learningPath.id}
                    parentOptions={parentOptions}
                    onSuccess={handleTopicCreated}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <TopicTree
          sections={learningPath.sections}
          activeTopicId={activeTopic.id}
          onSelectTopic={(topic) => setActiveTopicIdState(topic.id)}
          highlightedTopicId={highlightedTopicId}
        />
        <TopicPreviewPanel topic={activeTopic} />
      </section>
    </div>
  );
}
