import type {
  TopicCompletion,
  TopicCompletionSignal,
  TopicLearningState,
} from "@/entities/topic/model/topic";

type TopicProgressInput = {
  completedSessions: number;
  knowledgeDocuments: number;
  resources: number;
  practiceAttempts: number;
  successfulPracticeAttempts: number;
  blockedPracticeAttempts: number;
  hasActiveSession?: boolean;
  hasExplicitCompletion?: boolean;
  isLegacyCompleted?: boolean;
};

const checklistLabels: Record<TopicCompletionSignal["key"], Omit<TopicCompletionSignal, "complete">> =
  {
    session: {
      key: "session",
      label: "Session completed",
      description: "Finish one focused learning session for this topic.",
    },
    knowledge: {
      key: "knowledge",
      label: "Knowledge captured",
      description: "Create at least one knowledge document from the session.",
    },
    resource: {
      key: "resource",
      label: "Resource attached",
      description: "Attach a useful learning material to support the topic.",
    },
    practiceAttempted: {
      key: "practiceAttempted",
      label: "Practice attempted",
      description: "Record at least one deliberate practice attempt.",
    },
    practiceSolved: {
      key: "practiceSolved",
      label: "Solved successfully",
      description: "Record a solved attempt to show applied understanding.",
    },
  };

export function deriveTopicCompletion(input: TopicProgressInput): TopicCompletion {
  const signals: TopicCompletionSignal[] = [
    {
      ...checklistLabels.session,
      complete: input.completedSessions > 0,
    },
    {
      ...checklistLabels.knowledge,
      complete: input.knowledgeDocuments > 0,
    },
    {
      ...checklistLabels.resource,
      complete: input.resources > 0,
    },
    {
      ...checklistLabels.practiceAttempted,
      complete: input.practiceAttempts > 0,
    },
    {
      ...checklistLabels.practiceSolved,
      complete: input.successfulPracticeAttempts > 0,
    },
  ];

  const completedCount = signals.filter((signal) => signal.complete).length;
  const checklistTotal = signals.length;
  const canComplete = completedCount === checklistTotal;
  const hasCompletionOverride = Boolean(input.hasExplicitCompletion || input.isLegacyCompleted);
  const isCompleted = canComplete || hasCompletionOverride;
  const state = deriveLearningState(input, canComplete, hasCompletionOverride);
  const nextRequirement =
    signals.find((signal) => !signal.complete)?.label ??
    (isCompleted ? "Topic completed." : "Ready for review.");

  return {
    state,
    signals,
    canComplete,
    isCompleted,
    nextRequirement,
    completedCount,
    checklistTotal,
    percentage: Math.round((completedCount / checklistTotal) * 100),
  };
}

function deriveLearningState(
  input: TopicProgressInput,
  canComplete: boolean,
  hasCompletionOverride: boolean,
): TopicLearningState {
  if (canComplete || hasCompletionOverride) {
    return "mastered";
  }

  if (input.blockedPracticeAttempts > 0 && input.successfulPracticeAttempts === 0) {
    return "review-needed";
  }

  if (input.practiceAttempts > 0) {
    return "practicing";
  }

  if (
    input.hasActiveSession ||
    input.completedSessions > 0 ||
    input.knowledgeDocuments > 0 ||
    input.resources > 0
  ) {
    return "learning";
  }

  return "not-started";
}

export function getTopicLearningStateLabel(state: TopicLearningState) {
  const labels: Record<TopicLearningState, string> = {
    "not-started": "states.not-started",
    learning: "states.learning",
    practicing: "states.practicing",
    "review-needed": "states.review-needed",
    mastered: "states.mastered",
  };

  return labels[state];
}
