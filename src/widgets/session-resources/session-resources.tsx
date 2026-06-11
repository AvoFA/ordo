"use client";

import { useState } from "react";
import { 
  Library, 
  ExternalLink, 
  Settings, 
  Plus, 
  FileText, 
  PlayCircle, 
  BookOpen, 
  Globe, 
  FileCode,
  Image as ImageIcon,
  Presentation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/model/ui-store";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { CreateResourceForm, EditResourceForm } from "@/features/learning-paths/ui/resource-forms";

type SessionResourcesProps = {
  resources: {
    id: string;
    title: string;
    source: "URL" | "MANUAL" | "FILE";
    url: string | null;
    type: "ARTICLE" | "VIDEO" | "BOOK" | "WEBSITE" | "PDF" | "DOCX" | "PPTX" | "IMAGE";
    description: string | null;
    fileName?: string | null;
    sizeLabel?: string | null;
  }[];
  topicId: string | null;
};

export function SessionResources({ resources, topicId }: SessionResourcesProps) {
  const { isEditMode } = useUiStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const { t } = useTranslation();

  function getResourceDetails(type: "ARTICLE" | "VIDEO" | "BOOK" | "WEBSITE" | "PDF" | "DOCX" | "PPTX" | "IMAGE") {
    switch (type) {
      case "ARTICLE":
        return {
          icon: <FileText className="h-4 w-4 text-emerald-500 shrink-0" />,
          accent: "border-l-emerald-500/60 dark:border-l-emerald-500/40",
          label: t("inbox.typeArticle"),
          color: "text-emerald-500 bg-emerald-500/8 border-emerald-500/10",
        };
      case "VIDEO":
        return {
          icon: <PlayCircle className="h-4 w-4 text-red-500 shrink-0" />,
          accent: "border-l-red-500/60 dark:border-l-red-500/40",
          label: t("inbox.typeVideo"),
          color: "text-red-500 bg-red-500/8 border-red-500/10",
        };
      case "BOOK":
        return {
          icon: <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />,
          accent: "border-l-blue-500/60 dark:border-l-blue-500/40",
          label: t("inbox.typeBook"),
          color: "text-blue-500 bg-blue-500/8 border-blue-500/10",
        };
      case "PDF":
        return {
          icon: <FileCode className="h-4 w-4 text-amber-500 shrink-0" />,
          accent: "border-l-amber-500/60 dark:border-l-amber-500/40",
          label: t("inbox.typePdf"),
          color: "text-amber-500 bg-amber-500/8 border-amber-500/10",
        };
      case "DOCX":
        return {
          icon: <FileText className="h-4 w-4 text-sky-500 shrink-0" />,
          accent: "border-l-sky-500/60 dark:border-l-sky-500/40",
          label: t("inbox.typeDocx"),
          color: "text-sky-500 bg-sky-500/8 border-sky-500/10",
        };
      case "PPTX":
        return {
          icon: <Presentation className="h-4 w-4 text-orange-500 shrink-0" />,
          accent: "border-l-orange-500/60 dark:border-l-orange-500/40",
          label: t("inbox.typePptx"),
          color: "text-orange-500 bg-orange-500/8 border-orange-500/10",
        };
      case "IMAGE":
        return {
          icon: <ImageIcon className="h-4 w-4 text-violet-500 shrink-0" />,
          accent: "border-l-violet-500/60 dark:border-l-violet-500/40",
          label: t("inbox.typeImage"),
          color: "text-violet-500 bg-violet-500/8 border-violet-500/10",
        };
      case "WEBSITE":
      default:
        return {
          icon: <Globe className="h-4 w-4 text-indigo-400 shrink-0" />,
          accent: "border-l-indigo-500/60 dark:border-l-indigo-500/40",
          label: t("inbox.typeLink"),
          color: "text-indigo-400 bg-indigo-400/8 border-indigo-400/10",
        };
    }
  }

  if ((!resources || resources.length === 0) && !isEditMode) return null;

  return (
    <Card className="rounded-lg border-border/70 bg-card/85 shadow-none">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Library aria-hidden="true" className="h-4 w-4 text-primary" />
          {t("sessions.studyResources")}
        </CardTitle>
        {isEditMode && topicId && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-md hover:bg-secondary/40 text-muted-foreground hover:text-foreground">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-0">
              <div className="border-b border-border/70 px-6 py-5">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {t("sessions.addResource")}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  {t("sessions.addResourceDesc")}
                </DialogDescription>
              </div>
              <div className="px-6 py-5">
                <CreateResourceForm topicId={topicId} onSuccess={() => setCreateOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <p className="text-xs text-muted-foreground/80 italic py-2 text-center">
            {t("sessions.noResourcesAttached")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map((resource) => {
              const details = getResourceDetails(resource.type);

              return (
                <Card 
                  key={resource.id} 
                  className={`relative overflow-hidden border-l-[3.5px] border-border/30 bg-card/45 hover:border-primary/30 transition-all duration-300 shadow-sm p-4 gap-0 ${details.accent}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-2.5">
                      {details.icon}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground leading-tight truncate">
                            {resource.title}
                          </h4>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${details.color}`}
                          >
                            {details.label}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground/95 leading-relaxed mt-1.5 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          <span>{resource.source === "FILE" ? "File upload" : "URL link"}</span>
                          {resource.sizeLabel && <span>&bull; {resource.sizeLabel}</span>}
                          {resource.fileName && <span className="normal-case tracking-normal truncate max-w-40">&bull; {resource.fileName}</span>}
                        </div>
                      </div>
                    </div>

                    {isEditMode && (
                      <Dialog open={activeEditId === resource.id} onOpenChange={(open) => setActiveEditId(open ? resource.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="h-6 w-6 rounded-md hover:bg-secondary/40 text-muted-foreground hover:text-foreground shrink-0 select-none">
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl p-0">
                          <div className="border-b border-border/70 px-6 py-5">
                            <DialogTitle className="text-xl font-semibold tracking-tight">
                              {t("sessions.editResource")}
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm">
                              {t("sessions.editResourceDesc")}
                            </DialogDescription>
                          </div>
                          <div className="px-6 py-5">
                            <EditResourceForm
                              resourceId={resource.id}
                              initialTitle={resource.title}
                              initialUrl={resource.url ?? ""}
                              initialType={resource.type}
                              initialDescription={resource.description}
                              onSuccess={() => setActiveEditId(null)}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {resource.url && (
                    <div className="mt-4 pt-2.5 border-t border-border/10">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                      >
                        {resource.source === "FILE" ? t("inbox.typeDownload") : t("sessions.openResource")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
