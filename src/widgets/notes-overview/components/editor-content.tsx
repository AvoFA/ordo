"use client";

import { useState, useEffect, useMemo } from "react";
import { EditorContent } from "@tiptap/react";
import {
  Image as ImageIcon,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
} from "lucide-react";
import { useDocumentEditor } from "../hooks/use-document-editor";
import { SlashMenu, type SlashCommand } from "./slash-menu";

type EditorType = ReturnType<typeof useDocumentEditor>;

type EditorContentProps = {
  editor: EditorType;
  noteId: string;
};

export function NoteEditorContent({ editor }: EditorContentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [slashMenu, setSlashMenu] = useState<{ x: number; y: number; query: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tEditor = editor.tiptapEditor;

  const commands = useMemo<SlashCommand[]>(() => [
    {
      icon: Heading1,
      label: "Heading 1",
      description: "Big section heading",
      action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      description: "Medium section heading",
      action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: CheckSquare,
      label: "Checklist",
      description: "Interactive task checklist",
      action: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      icon: List,
      label: "Bullet List",
      description: "Simple bulleted list",
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      icon: Quote,
      label: "Blockquote",
      description: "Insert a quote block",
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: Code,
      label: "Code Block",
      description: "Code snippet with formatting",
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      icon: TableIcon,
      label: "Insert Table",
      description: "Add a grid table to your page",
      action: (ed) => ed.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run(),
    },
    {
      icon: Minus,
      label: "Horizontal Rule",
      description: "Add a divider line",
      action: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },
  ], []);

  // Filter commands based on current query
  const filteredCommands = useMemo(() => {
    if (!slashMenu) return [];
    const q = slashMenu.query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        (cmd.description && cmd.description.toLowerCase().includes(q))
    );
  }, [slashMenu, commands]);

  const safeSelectedIndex =
    filteredCommands.length > 0 ? Math.min(selectedIndex, filteredCommands.length - 1) : 0;

  // Setup event listeners on editor
  useEffect(() => {
    if (!tEditor) return;

    const handleUpdate = () => {
      const { state } = tEditor;
      const { selection } = state;
      const { $from } = selection;

      if ($from.parent.type.name !== "paragraph") {
        setSlashMenu(null);
        return;
      }

      const text = $from.parent.textContent;
      if (text.startsWith("/")) {
        const query = text.slice(1);
        try {
          const coords = tEditor.view.coordsAtPos($from.pos);
          setSlashMenu({
            x: coords.left,
            y: coords.top + 24,
            query,
          });
        } catch {
          // view coordinates failed
        }
      } else {
        setSlashMenu(null);
      }
    };

    tEditor.on("update", handleUpdate);
    tEditor.on("selectionUpdate", handleUpdate);

    return () => {
      tEditor.off("update", handleUpdate);
      tEditor.off("selectionUpdate", handleUpdate);
    };
  }, [tEditor]);

  if (!tEditor) {
    return (
      <div className="flex items-center justify-center min-h-[480px] w-full text-sm text-muted-foreground/45 italic font-medium">
        Loading editor...
      </div>
    );
  }

  const executeCommand = (cmd: SlashCommand) => {
    const { state } = tEditor;
    const { selection } = state;
    const { $from } = selection;

    const start = $from.start();
    const end = $from.pos;

    // Delete the "/" and the query text
    tEditor.chain().focus().deleteRange({ from: start, to: end }).run();

    // Execute the formatting command
    cmd.action(tEditor);

    setSlashMenu(null);
  };

  // Capture keyboard navigation events before Tiptap processes them
  const handleKeyDownCapture = (e: React.KeyboardEvent) => {
    if (slashMenu) {
      if (filteredCommands.length === 0) {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setSlashMenu(null);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (filteredCommands[safeSelectedIndex]) {
          executeCommand(filteredCommands[safeSelectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSlashMenu(null);
      }
    }
  };

  // Drag & drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      editor.handleImageFile(imageFile);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDownCapture={handleKeyDownCapture}
      className="relative min-h-[480px] w-full rounded-xl transition-all duration-200"
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xs border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 z-30 pointer-events-none animate-in fade-in duration-150">
          <ImageIcon className="h-8 w-8 text-primary animate-bounce" />
          <span className="text-sm font-bold text-foreground">
            Drop image here to insert as attachment
          </span>
        </div>
      )}

      {/* Tiptap Rich Text Editor */}
      <div className="ordo-prose focus-within:outline-none w-full">
        <EditorContent editor={tEditor} className="w-full focus-within:outline-none" />
      </div>

      {/* Slash Menu Popup */}
      {slashMenu && (
        <SlashMenu
          commands={filteredCommands}
          selectedIndex={safeSelectedIndex}
          onSelectCommand={executeCommand}
          onHoverIndex={setSelectedIndex}
          query={slashMenu.query}
          x={slashMenu.x}
          y={slashMenu.y}
        />
      )}
    </div>
  );
}
