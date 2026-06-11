"use client";

import { useActionState, useEffect } from "react";
import { Archive, ArrowRight, Inbox, Link2, Plus } from "lucide-react";
import type { InboxItemPreview } from "@/entities/inbox/model/inbox";
import type { PracticeTopicOption } from "@/entities/practice-task/model/practice-task";
import {
  assignInboxItemAction,
  createInboxItemAction,
  discardInboxItemAction,
  type InboxActionState,
} from "@/features/inbox/actions/inbox.actions";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useUiStore } from "@/shared/model/ui-store";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type LearningInboxProps = {
  items: InboxItemPreview[];
  topicOptions: PracticeTopicOption[];
};

const initialState: InboxActionState = {};

export function LearningInbox({ items, topicOptions }: LearningInboxProps) {
  const { t } = useTranslation();
  const [createState, createAction, isCreating] = useActionState(
    createInboxItemAction,
    initialState,
  );
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (createState.success) {
      addToast({
        type: "success",
        message: t("inbox.capturedSuccess"),
        description: t("inbox.capturedSuccessDesc"),
      });
    }
  }, [createState.success, addToast, t]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t("inbox.eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("inbox.title")}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("inbox.subtitle")}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="rounded-xl border-border/45 bg-card/75 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Plus className="h-4 w-4 text-primary" />
              {t("inbox.quickCapture")}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              {t("inbox.quickCaptureDesc")}
            </p>
            <form action={createAction} className="space-y-4">
              <input type="hidden" name="source" value="URL" />
              <div className="space-y-2">
                <label htmlFor="inbox-title" className="text-xs font-semibold text-foreground">
                  {t("inbox.titleLabel")}
                </label>
                <Input id="inbox-title" name="title" placeholder={t("inbox.titlePlaceholder")} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="space-y-2">
                  <label htmlFor="inbox-type" className="text-xs font-semibold text-foreground">
                    {t("inbox.typeLabel")}
                  </label>
                  <Select id="inbox-type" name="type" defaultValue="ARTICLE">
                    <option value="ARTICLE">Article</option>
                    <option value="VIDEO">Video</option>
                    <option value="BOOK">Book</option>
                    <option value="WEBSITE">Website</option>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">Document</option>
                    <option value="PPTX">Slides</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="inbox-url" className="text-xs font-semibold text-foreground">
                    {t("inbox.urlLabel")}
                  </label>
                  <Input id="inbox-url" name="url" type="url" placeholder="https://..." required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="inbox-description" className="text-xs font-semibold text-foreground">
                  {t("inbox.whyCapture")}
                </label>
                <Input id="inbox-description" name="description" placeholder={t("inbox.whyCaptureDesc")} />
              </div>
              {createState.error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive">
                  {createState.error}
                </p>
              ) : null}
              <Button type="submit" className="w-full rounded-lg" disabled={isCreating}>
                {isCreating ? t("inbox.capturingBtn") : t("inbox.captureBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {items.length > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{t("inbox.intakeQueue")}</h2>
                <p className="text-xs text-muted-foreground">
                  {t("inbox.queueDesc")}
                </p>
              </div>
              <Badge variant="metadata">
                {t("inbox.itemsCaptured", { count: items.length }).replace("{count}", String(items.length))}
              </Badge>
            </div>
          ) : null}
          {items.length === 0 ? (
            <Card className="rounded-xl border-dashed border-border/60 bg-card/40 shadow-none">
              <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground/50" />
                <div className="text-sm font-semibold text-foreground">{t("inbox.emptyTitle")}</div>
                <p className="max-w-md text-xs leading-5 text-muted-foreground">
                  {t("inbox.emptyDesc")}
                </p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <InboxItemCard key={item.id} item={item} topicOptions={topicOptions} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InboxItemCard({
  item,
  topicOptions,
}: {
  item: InboxItemPreview;
  topicOptions: PracticeTopicOption[];
}) {
  const { t } = useTranslation();
  const [assignState, assignAction, isAssigning] = useActionState(
    assignInboxItemAction,
    initialState,
  );
  const [discardState, discardAction, isDiscarding] = useActionState(
    discardInboxItemAction,
    initialState,
  );
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (assignState.success) {
      addToast({
        type: "success",
        message: t("inbox.assignedSuccess"),
        description: t("inbox.assignedSuccessDesc", { title: item.title }).replace("{title}", item.title),
      });
    }
  }, [assignState.success, addToast, item.title, t]);

  useEffect(() => {
    if (discardState.success) {
      addToast({
        type: "success",
        message: t("inbox.discardedSuccess"),
        description: t("inbox.discardedSuccessDesc", { title: item.title }).replace("{title}", item.title),
      });
    }
  }, [discardState.success, addToast, item.title, t]);

  return (
    <Card className="rounded-xl border-border/35 bg-card/70 shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold leading-tight text-foreground">{item.title}</h2>
              <Badge variant="metadata">{item.type}</Badge>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("inbox.captured")} {item.capturedAt}
              {item.assignedTopic ? ` / ${item.assignedPath} / ${item.assignedTopic}` : ""}
            </p>
          </div>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Link2 className="h-3.5 w-3.5" />
              {t("common.open")}
            </a>
          ) : null}
        </div>

        {item.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
        ) : null}

        {item.status === "assigned" ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/35 bg-secondary/15 p-3 text-xs font-semibold text-muted-foreground">
            <Archive className="h-3.5 w-3.5 text-primary" />
            {t("inbox.assigned")}
          </div>
        ) : (
          <div className="space-y-2">
            <form action={assignAction} className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="itemId" value={item.id} />
              <Select name="topicId" required className="sm:flex-1">
                <option value="">{t("inbox.assignToTopic")}</option>
                {topicOptions.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.pathTitle} / {topic.title}
                  </option>
                ))}
              </Select>
              <Button type="submit" className="gap-2 rounded-lg" disabled={isAssigning}>
                {isAssigning ? t("inbox.assigningBtn") : t("inbox.assignBtn")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
            <form action={discardAction} className="flex justify-end">
              <input type="hidden" name="itemId" value={item.id} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                disabled={isDiscarding}
              >
                {isDiscarding ? t("inbox.discardingBtn") : t("inbox.discardBtn")}
              </Button>
            </form>
            {assignState.error || discardState.error ? (
              <p className="text-xs text-destructive">
                {assignState.error ?? discardState.error}
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
