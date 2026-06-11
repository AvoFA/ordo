import type { NotePreview } from "@/entities/note/model/note";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type NoteCardProps = {
  note: NotePreview;
  variant?: "default" | "compact";
};

export function NoteCard({ note, variant = "default" }: NoteCardProps) {
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="space-y-2 p-1.5 text-foreground/90">
        <h4 className="text-sm font-bold text-foreground leading-snug">{note.title}</h4>
        <p className="text-xs leading-relaxed text-muted-foreground">{note.excerpt}</p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {note.tags.map((tag) => (
              <span key={tag} className="text-[9px] text-muted-foreground/60 bg-secondary/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="rounded-xl border border-border/30 bg-card/60 shadow-sm transition-all duration-300 hover:border-primary/45 hover:bg-card hover:shadow-md">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold leading-tight text-foreground">
              {note.title}
            </CardTitle>
            <p className="mt-1.5 text-xs font-medium text-muted-foreground/80 tracking-wide uppercase">
              {note.linkedPath} &bull; {note.linkedTopic}
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground/75">
            {note.updatedTime}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        <p className="text-xs leading-relaxed text-muted-foreground">{note.excerpt}</p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-border/10">
            {note.tags.map((tag) => (
              <span key={tag} className="text-[9px] text-muted-foreground/60 bg-secondary/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
