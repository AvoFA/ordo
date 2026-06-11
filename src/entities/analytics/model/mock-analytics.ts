export interface LearningSummary {
  totalHours: number;
  completedTopicsCount: number;
  activePathsCount: number;
  currentStreakDays: number;
}

export interface WeeklyRhythmDay {
  dayName: string;
  hours: number;
  label: string;
}

export interface PathProgress {
  id: string;
  title: string;
  completedTopics: number;
  totalTopics: number;
  percentage: number;
}

export interface PracticeStats {
  completed: number;
  inProgress: number;
  todo: number;
  reviewLater: number;
}

export interface LearningContinuity {
  lastStudiedTopic: string;
  pathTitle: string;
  timeAgo: string;
  nextRecommendedStep: string;
  nextTopicTitle: string;
}

export const mockLearningSummary: LearningSummary = {
  totalHours: 24.5,
  completedTopicsCount: 18,
  activePathsCount: 3,
  currentStreakDays: 5,
};

export const mockWeeklyRhythm: WeeklyRhythmDay[] = [
  { dayName: "Пн", hours: 1.5, label: "1.5 ч" },
  { dayName: "Вт", hours: 2.2, label: "2.2 ч" },
  { dayName: "Ср", hours: 0.8, label: "48 мин" },
  { dayName: "Чт", hours: 3.0, label: "3.0 ч" },
  { dayName: "Пт", hours: 1.2, label: "1.2 ч" },
  { dayName: "Сб", hours: 0.0, label: "0 ч" },
  { dayName: "Вс", hours: 0.5, label: "30 мин" },
];

export const mockPathProgress: PathProgress[] = [
  {
    id: "path-1",
    title: "Frontend Engineering",
    completedTopics: 13,
    totalTopics: 20,
    percentage: 65,
  },
  {
    id: "path-2",
    title: "Computer Science Fundamentals",
    completedTopics: 6,
    totalTopics: 20,
    percentage: 30,
  },
  {
    id: "path-3",
    title: "English for IT",
    completedTopics: 3,
    totalTopics: 20,
    percentage: 15,
  },
];

export const mockPracticeStats: PracticeStats = {
  completed: 12,
  inProgress: 4,
  todo: 5,
  reviewLater: 2,
};

export const mockLearningContinuity: LearningContinuity = {
  lastStudiedTopic: "Semantic HTML",
  pathTitle: "Frontend Engineering",
  timeAgo: "2 часа назад",
  nextRecommendedStep: "Продолжить прерванную сессию по теме Forms",
  nextTopicTitle: "Forms",
};
