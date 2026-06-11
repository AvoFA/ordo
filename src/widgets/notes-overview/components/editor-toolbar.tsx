import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Bold,
  Italic,
  Quote,
  List,
  CheckSquare,
  Code,
  Link as LinkIcon,
  Minus,
  Table as TableIcon,
  ImageIcon,
} from "lucide-react";

import { useDocumentEditor } from "../hooks/use-document-editor";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type EditorType = ReturnType<typeof useDocumentEditor>;

type EditorToolbarProps = {
  editor: EditorType;
  editorView: "write" | "preview" | "split";
  setEditorView: (view: "write" | "preview" | "split") => void;
  canUndo: boolean;
  canRedo: boolean;
  onlyViewSwitcher?: boolean;
};

export function EditorToolbar({
  editor,
  editorView,
  setEditorView,
  canUndo,
  canRedo,
  onlyViewSwitcher = false,
}: EditorToolbarProps) {
  const tEditor = editor.tiptapEditor;
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!tEditor) {
    return (
      <div className="h-10 flex items-center justify-center text-xs text-muted-foreground/40">
        Loading editor...
      </div>
    );
  }

  const handleLinkClick = () => {
    const previousUrl = tEditor.getAttributes("link").href;
    setLinkUrl(previousUrl || "https://");
    setIsLinkDialogOpen(true);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim() === "" || linkUrl.trim() === "https://") {
      tEditor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      tEditor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setIsLinkDialogOpen(false);
  };

  const handleTableInsert = () => {
    tEditor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
  };

  // Helper to determine if a button is active
  const isActive = (name: string, attributes?: Record<string, unknown>) => {
    return tEditor.isActive(name, attributes);
  };

  const toolbarButtons = [
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => tEditor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => tEditor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: isActive("heading", { level: 2 }),
    },
    { separator: true },
    {
      icon: Bold,
      label: "Bold",
      action: () => tEditor.chain().focus().toggleBold().run(),
      active: isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => tEditor.chain().focus().toggleItalic().run(),
      active: isActive("italic"),
    },
    { separator: true },
    {
      icon: Quote,
      label: "Blockquote",
      action: () => tEditor.chain().focus().toggleBlockquote().run(),
      active: isActive("blockquote"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => tEditor.chain().focus().toggleBulletList().run(),
      active: isActive("bulletList"),
    },
    {
      icon: CheckSquare,
      label: "Checklist",
      action: () => tEditor.chain().focus().toggleTaskList().run(),
      active: isActive("taskList"),
    },
    {
      icon: Code,
      label: "Code Block",
      action: () => tEditor.chain().focus().toggleCodeBlock().run(),
      active: isActive("codeBlock"),
    },
    { separator: true },
    {
      icon: LinkIcon,
      label: "Insert Link",
      action: handleLinkClick,
      active: isActive("link"),
    },
    {
      icon: Minus,
      label: "Horizontal Rule",
      action: () => tEditor.chain().focus().setHorizontalRule().run(),
      active: false,
    },
    {
      icon: TableIcon,
      label: "Insert Table",
      action: handleTableInsert,
      active: isActive("table"),
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
      {/* Tiptap Text Actions (Only active in edit/write views) */}
      {!onlyViewSwitcher ? (
        <div className="flex items-center gap-0.5 bg-secondary/35 backdrop-blur-md border border-border/30 rounded-lg p-1 transition-all duration-200">
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            onClick={editor.undo}
            disabled={!canUndo}
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-secondary/50 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y)"
            onClick={editor.redo}
            disabled={!canRedo}
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-secondary/50 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          
          <div className="h-4 w-px bg-border/40 mx-0.5" />

          {toolbarButtons.map((btn, idx) => {
            if ("separator" in btn) {
              return <div key={idx} className="h-4 w-px bg-border/40 mx-0.5" />;
            }

            const Icon = btn.icon;
            return (
              <button
                key={btn.label}
                type="button"
                title={btn.label}
                onClick={btn.action}
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer",
                  btn.active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}

          {/* Real Image Uploader Button */}
          <div className="h-4 w-px bg-border/40 mx-0.5" />
          <label
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
            title="Attach Image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) editor.handleImageFile(file);
              }}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Editor View Tab Switcher */}
      <div className="flex items-center gap-1 bg-secondary/20 p-0.5 rounded-md border border-border/30 backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setEditorView("write")}
          className={cn(
            "px-2.5 py-1 text-[10px] font-bold rounded-sm transition-colors cursor-pointer",
            editorView === "write" ? "bg-surface shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setEditorView("preview")}
          className={cn(
            "px-2.5 py-1 text-[10px] font-bold rounded-sm transition-colors cursor-pointer",
            editorView === "preview" ? "bg-surface shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => setEditorView("split")}
          className={cn(
            "px-2.5 py-1 text-[10px] font-bold rounded-sm transition-colors cursor-pointer",
            editorView === "split" ? "bg-surface shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Split
        </button>
      </div>

      {/* Link Insertion Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Insert Hyperlink</DialogTitle>
          <DialogDescription>
            Enter the URL address for your link. Leaving it empty will remove the link.
          </DialogDescription>
          <form onSubmit={handleLinkSubmit} className="mt-4 space-y-4">
            <Input
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                Apply Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
