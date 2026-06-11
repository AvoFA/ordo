"use client";

import type { ReactNode } from "react";
import { useActionState, useState, useEffect } from "react";
import {
  createFileResourceAction,
  createResourceAction,
  deleteResourceAction,
  updateResourceAction,
  type ActionState,
} from "@/features/resources/actions/resource.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/model/ui-store";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

type CreateResourceFormProps = {
  topicId: string;
  onSuccess?: () => void;
};

const initialState: ActionState = {};
type ResourceMode = "link" | "file";

export function CreateResourceForm({ topicId, onSuccess }: CreateResourceFormProps) {
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(createResourceAction, initialState);
  const [fileState, fileFormAction, isFilePending] = useActionState(
    createFileResourceAction,
    initialState,
  );
  const [mode, setMode] = useState<ResourceMode>("link");
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (state.success) {
      addToast({
        type: "success",
        message: t("sessions.stepStudy"),
        description: t("sessions.sessionCompletedDesc"),
      });
      if (onSuccess) onSuccess();
    }
  }, [state.success, addToast, onSuccess, t]);

  useEffect(() => {
    if (fileState.success) {
      addToast({
        type: "success",
        message: t("sessions.stepStudy"),
        description: t("sessions.sessionCompletedDesc"),
      });
      if (onSuccess) onSuccess();
    }
  }, [fileState.success, addToast, onSuccess, t]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 rounded-xl bg-secondary/35 p-1 gap-1 border border-border/40">
        <ResourceModeButton active={mode === "link"} onClick={() => setMode("link")}>
          {t("sessions.modeLink")}
        </ResourceModeButton>
        <ResourceModeButton active={mode === "file"} onClick={() => setMode("file")}>
          {t("sessions.modeFile")}
        </ResourceModeButton>
      </div>

      {mode === "link" ? (
        <form
          action={formAction}
          className="space-y-4"
          aria-label="Create link resource"
        >
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="source" value="URL" />

          <Field label={t("sessions.titleLabel")} htmlFor="res-title">
            <Input
              id="res-title"
              name="title"
              placeholder="MDN Semantic HTML Guide"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <Field label={t("inbox.typeLabel")} htmlFor="res-type">
              <Select id="res-type" name="type" defaultValue="WEBSITE" required>
                <option value="ARTICLE">{t("inbox.typeArticle")}</option>
                <option value="VIDEO">{t("inbox.typeVideo")}</option>
                <option value="BOOK">{t("inbox.typeBook")}</option>
                <option value="WEBSITE">{t("inbox.typeLink")}</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="PPTX">PPTX</option>
                <option value="IMAGE">{t("inbox.typeImage")}</option>
              </Select>
            </Field>

            <Field label="URL" htmlFor="res-url">
              <Input
                id="res-url"
                name="url"
                type="url"
                placeholder="https://developer.mozilla.org..."
                required
              />
            </Field>
          </div>

          <Field label={t("sessions.descriptionLabel")} hint={t("common.optional")} htmlFor="res-desc">
            <Input
              id="res-desc"
              name="description"
              placeholder={t("sessions.descriptionPlaceholder")}
            />
          </Field>

          {state.error ? <FormError>{state.error}</FormError> : null}

          <Button type="submit" disabled={isPending} className="h-10 w-full font-bold">
            {isPending ? t("common.loading") : t("sessions.createLink")}
          </Button>
        </form>
      ) : (
        <form
          action={fileFormAction}
          className="space-y-4"
          aria-label="Create file resource"
        >
          <input type="hidden" name="topicId" value={topicId} />

          <Field label={t("sessions.titleLabel")} htmlFor="file-res-title">
            <Input
              id="file-res-title"
              name="title"
              placeholder="Accessibility checklist PDF"
              required
            />
          </Field>

          <Field label={t("sessions.modeFile")} htmlFor="file-res-file">
            <Input
              id="file-res-file"
              name="file"
              type="file"
              accept=".pdf,.docx,.pptx,image/png,image/jpeg,image/webp,image/gif"
              required
            />
            <p className="text-xs leading-5 text-muted-foreground mt-1">
              {t("sessions.fileSizeLimit")}
            </p>
          </Field>

          <Field label={t("sessions.descriptionLabel")} hint={t("common.optional")} htmlFor="file-res-desc">
            <Input
              id="file-res-desc"
              name="description"
              placeholder={t("sessions.descriptionPlaceholder")}
            />
          </Field>

          {fileState.error ? <FormError>{fileState.error}</FormError> : null}

          <Button type="submit" disabled={isFilePending} className="h-10 w-full font-bold">
            {isFilePending ? t("common.loading") : t("sessions.createFile")}
          </Button>
        </form>
      )}
    </div>
  );
}

type EditResourceFormProps = {
  resourceId: string;
  initialTitle: string;
  initialUrl: string;
  initialType: string;
  initialDescription?: string | null;
  onSuccess?: () => void;
};

export function EditResourceForm({
  resourceId,
  initialTitle,
  initialUrl,
  initialType,
  initialDescription,
  onSuccess
}: EditResourceFormProps) {
  const { t } = useTranslation();
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateResourceAction, initialState);
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteResourceAction, initialState);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (updateState.success) {
      addToast({
        type: "success",
        message: t("sessions.stepStudy"),
        description: t("sessions.sessionCompletedDesc"),
      });
      if (onSuccess) onSuccess();
    }
  }, [updateState.success, addToast, onSuccess, t]);

  useEffect(() => {
    if (deleteState.success) {
      addToast({
        type: "success",
        message: t("sessions.stepStudy"),
        description: t("sessions.sessionCompletedDesc"),
      });
      if (onSuccess) onSuccess();
    }
  }, [deleteState.success, addToast, onSuccess, t]);

  return (
    <div className="space-y-6">
      <form
        action={updateFormAction}
        className="space-y-4"
        aria-label="Edit resource"
      >
        <input type="hidden" name="resourceId" value={resourceId} />
        <input type="hidden" name="source" value="URL" />

        <Field label={t("sessions.titleLabel")} htmlFor="edit-res-title">
          <Input id="edit-res-title" name="title" defaultValue={initialTitle} required />
        </Field>

        <Field label={t("inbox.typeLabel")} htmlFor="edit-res-type">
          <Select id="edit-res-type" name="type" defaultValue={initialType} required>
            <option value="ARTICLE">{t("inbox.typeArticle")}</option>
            <option value="VIDEO">{t("inbox.typeVideo")}</option>
            <option value="BOOK">{t("inbox.typeBook")}</option>
            <option value="WEBSITE">{t("inbox.typeLink")}</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="PPTX">PPTX</option>
            <option value="IMAGE">{t("inbox.typeImage")}</option>
          </Select>
        </Field>

        <Field label="URL" htmlFor="edit-res-url">
          <Input id="edit-res-url" name="url" type="url" defaultValue={initialUrl} required />
        </Field>

        <Field label={t("sessions.descriptionLabel")} hint={t("common.optional")} htmlFor="edit-res-desc">
          <Input id="edit-res-desc" name="description" defaultValue={initialDescription ?? ""} />
        </Field>

        {updateState.error ? <FormError>{updateState.error}</FormError> : null}

        <Button type="submit" disabled={isUpdatePending} className="h-10 w-full font-bold">
          {isUpdatePending ? t("common.loading") : t("sessions.saveResource")}
        </Button>
      </form>

      <div className="pt-4 border-t border-border/15">
        {confirmDelete ? (
          <form action={deleteFormAction} className="flex items-center gap-2">
            <input type="hidden" name="resourceId" value={resourceId} />
            <span className="text-xs text-muted-foreground/75 font-semibold">{t("sessions.confirmRemove")}</span>
            <Button
              type="submit"
              variant="outline"
              disabled={isDeletePending}
              className="text-xs text-destructive border-border/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 h-8 px-3 font-bold"
            >
              {isDeletePending ? t("common.loading") : t("common.delete")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-muted-foreground h-8 px-3 font-semibold hover:bg-secondary/40"
            >
              {t("common.cancel")}
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-xs font-bold text-muted-foreground/50 hover:text-destructive transition-colors"
          >
            {t("sessions.removeResource")}
          </button>
        )}

        {deleteState.error ? (
          <FormError className="mt-2">{deleteState.error}</FormError>
        ) : null}
      </div>
    </div>
  );
}

function ResourceModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-lg text-xs font-semibold text-muted-foreground transition-all duration-200 flex items-center justify-center outline-none focus:outline-none select-none border border-transparent cursor-pointer",
        active 
          ? "bg-card text-primary shadow-sm border-border/20 font-bold" 
          : "hover:bg-secondary/15 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Field({
  children,
  hint,
  htmlFor,
  label,
}: {
  children: ReactNode;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
          {label}
        </label>
        {hint ? <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/55">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function FormError({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive",
        className,
      )}
    >
      {children}
    </p>
  );
}

