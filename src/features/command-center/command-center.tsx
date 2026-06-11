"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  FileText,
  Home,
  Layers3,
  NotebookTabs,
  PlayCircle,
  Search,
  Settings,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  CommandCenterGroup,
  CommandIconKey,
} from "@/features/command-center/model/command-items";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { Kbd } from "@/shared/ui/kbd";

type CommandCenterProps = {
  groups: CommandCenterGroup[];
};

const iconMap: Record<CommandIconKey, typeof Home> = {
  analytics: BarChart3,
  book: BookOpen,
  file: FileText,
  home: Home,
  layers: Layers3,
  notes: NotebookTabs,
  play: PlayCircle,
  settings: Settings,
  target: Target,
};

export function CommandCenter({ groups }: CommandCenterProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function selectCommand(href: string) {
    setOpen(false);
    router.push(href);
  }

  function getGroupLabel(groupId: string, defaultLabel: string) {
    switch (groupId) {
      case "current-learning":
        return t("nav.learningFocus");
      case "learning-paths":
        return t("nav.paths");
      case "topics":
        return t("paths.topicsCount", { count: 5 }).replace(/[0-9\s]+/g, ""); // topics label
      case "notes":
        return t("nav.notes");
      case "practice":
        return t("nav.practice");
      case "navigation":
        return t("nav.workspace") || "Navigation";
      default:
        return defaultLabel;
    }
  }

  function getItemDetails(item: typeof groups[0]["items"][0]) {
    let title = item.title;
    let description = item.description;

    if (item.kind === "navigation") {
      switch (item.id) {
        case "nav-today":
          title = t("nav.today");
          description = t("commands.navTodayDesc");
          break;
        case "nav-learning-paths":
          title = t("nav.paths");
          description = t("commands.navPathsDesc");
          break;
        case "nav-sessions":
          title = t("nav.sessions");
          description = t("commands.navSessionsDesc");
          break;
        case "nav-notes":
          title = t("nav.notes");
          description = t("commands.navNotesDesc");
          break;
        case "nav-practice":
          title = t("nav.practice");
          description = t("commands.navPracticeDesc");
          break;
        case "nav-analytics":
          title = t("nav.analytics");
          description = t("commands.navAnalyticsDesc");
          break;
        case "nav-settings":
          title = t("nav.settings");
          description = t("commands.navSettingsDesc");
          break;
      }
    } else if (item.id === "current-path") {
      description = t("commands.currentPathDesc");
    } else if (item.id === "current-topic") {
      description = t("commands.currentTopicDesc");
    } else if (item.id === "continue-session") {
      title = t("commands.continueSessionTitle");
      const match = item.description.match(/(\d+)%\s*complete\s*\/\s*(.*)/i);
      if (match) {
        description = t("commands.continueSessionDesc", { progress: match[1], time: match[2] });
      }
    } else if (item.id === "no-current-learning") {
      title = t("commands.noCurrentLearningTitle");
      description = t("commands.noCurrentLearningDesc");
    } else if (item.kind === "path") {
      const match = item.description.match(/(\d+)%\s*complete\s*\/\s*(\d+)\s*topics/i);
      if (match) {
        description = `${match[1]}% ${t("common.completed").toLowerCase()} / ${match[2]} ${t("paths.topicsCount", { count: parseInt(match[2], 10) }).replace(/[0-9]+/g, "").trim()}`;
      }
    } else if (item.kind === "topic") {
      const parts = item.description.split(" / ");
      if (parts.length === 2) {
        const pathTitle = parts[0];
        const status = parts[1]?.toLowerCase() ?? "";
        let translatedStatus = status;
        if (status === "in progress" || status === "learning") {
          translatedStatus = t("common.inProgress").toLowerCase();
        } else if (status === "completed") {
          translatedStatus = t("common.completed").toLowerCase();
        } else if (status === "needs review" || status === "review needed") {
          translatedStatus = t("common.needsReview").toLowerCase();
        } else if (status === "not started" || status === "ready to start") {
          translatedStatus = t("common.readyToStart").toLowerCase();
        }
        description = `${pathTitle} / ${translatedStatus}`;
      }
    }

    return { title, description };
  }

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-secondary/15 text-muted-foreground transition-all hover:border-primary/45 hover:bg-secondary/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 sm:w-64 sm:justify-between sm:px-3 cursor-pointer shrink-0"
        aria-label="Open Command Center"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Search aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
          <span className="hidden sm:inline text-xs font-semibold">{t("nav.commandSearch")}</span>
        </span>
        <span className="hidden sm:flex items-center gap-0.5 text-[9px] text-muted-foreground/50">
          <Kbd className="text-[9px] px-1 py-0">Ctrl</Kbd>
          <Kbd className="text-[9px] px-1.5 py-0">K</Kbd>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby="command-center-description"
          className="w-[calc(100vw-24px)] overflow-hidden p-0 sm:max-w-2xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{t("commands.title")}</DialogTitle>
          <DialogDescription id="command-center-description" className="sr-only">
            {t("commands.subtitle")}
          </DialogDescription>

          <Command shouldFilter loop>
            <div className="flex items-center justify-between border-b border-border/70 bg-surface-elevated px-4 py-3">
              <div>
                <div className="text-sm font-semibold leading-none text-foreground">
                  {t("commands.title")}
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">
                  {t("commands.subtitle")}
                </div>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <Kbd>Esc</Kbd>
                <span className="text-xs text-muted-foreground">{t("commands.close")}</span>
              </div>
            </div>

            <CommandInput autoFocus placeholder={t("commands.placeholder")} />
            <CommandList>
              <CommandEmpty>
                {t("commands.empty")}
              </CommandEmpty>
              {groups.map((group, index) => (
                <div key={group.id}>
                  {index > 0 ? <CommandSeparator /> : null}
                  <CommandGroup heading={getGroupLabel(group.id, group.label)}>
                    {group.items.map((item) => {
                      const Icon = iconMap[item.icon];
                      const { title, description } = getItemDetails(item);

                      return (
                        <CommandItem
                          key={item.id}
                          value={`${title} ${description} ${item.kind}`}
                          onSelect={() => selectCommand(item.href)}
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-secondary/40 text-muted-foreground">
                            <Icon aria-hidden="true" className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-foreground">{title}</div>
                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                              {description}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={item.kind === "context" ? "focus" : "metadata"}>
                              {item.kind}
                            </Badge>
                            {item.shortcut ? <Kbd>{item.shortcut}</Kbd> : null}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </div>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
