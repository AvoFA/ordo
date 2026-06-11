import type { LearningPathPreview } from "@/entities/learning-path/model/learning-path";
import { BookOpen, Layers3 } from "lucide-react";
import Link from "next/link";
import { Badge, StatusBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type LearningPathCardProps = {
  learningPath: LearningPathPreview;
};

export function LearningPathCard({ learningPath }: LearningPathCardProps) {
  const hasProgress = learningPath.progress > 0;
  const pathHref = `/learning-paths/${learningPath.slug}`;
  const completedCount = learningPath.completedTopicCount ?? 0;
  const totalCount = learningPath.topicCount;

  let progressLabel = "Ready to start";
  if (totalCount === 0) {
    progressLabel = "No topics yet";
  } else if (learningPath.progress === 100) {
    progressLabel = "All topics completed";
  } else if (hasProgress) {
    progressLabel = `${completedCount} of ${totalCount} topics complete`;
  }

  return (
    <Card className="rounded-lg border-border/75 bg-card shadow-none transition-colors hover:border-primary/35">
      <Link
        href={pathHref}
        className="cursor-pointer rounded-t-lg outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30"
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-[17px] leading-tight transition-colors hover:text-primary">
                {learningPath.title}
              </CardTitle>
              <CardDescription className="mt-2 leading-6">
                {learningPath.description}
              </CardDescription>
            </div>
            <StatusBadge status={learningPath.status ?? "ready-to-start"} />
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                {progressLabel}
              </span>
              <span className="font-medium text-foreground">
                {learningPath.progress}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary/80">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${learningPath.progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/65 bg-secondary/25 p-3 space-y-2.5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
                Current Topic
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{learningPath.focus}</div>
            </div>
            {learningPath.nextStep && (
              <div className="pt-2 border-t border-border/40">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary/75">
                  Recommended Next Step
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {learningPath.nextStep}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
            <Badge variant="metadata" icon={Layers3}>
              {totalCount} topics
            </Badge>
            <Badge variant="metadata">{learningPath.lastActivity}</Badge>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="justify-end gap-3 pt-0">
        {learningPath.progress === 100 ? (
          <Button asChild variant="secondary" size="sm" className="border border-border/60">
            <Link href={pathHref}>Review Path</Link>
          </Button>
        ) : hasProgress ? (
          <Button asChild variant="secondary" size="sm" className="border border-border/60">
            <Link href={pathHref}>Continue</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={pathHref}>Start Path</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
