"use client";

import { useRef, useState, useTransition } from "react";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  RefreshCw 
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { uploadAttachmentAction } from "@/features/attachments/actions/attachment.actions";

type ImageBlockProps = {
  src: string;
  alt: string;
  width: string;
  alignment: string;
  noteId: string;
  onUpdate: (updates: { src?: string; alt?: string; width?: string; alignment?: string }) => void;
  onDelete: () => void;
};

export function ImageBlock({
  src,
  alt,
  width,
  alignment,
  noteId,
  onUpdate,
  onDelete,
}: ImageBlockProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, startTransition] = useTransition();
  const [isFocused, setIsFocused] = useState(false);

  const sizes = [
    { label: "Small", value: "small", widthClass: "w-[240px]" },
    { label: "Medium", value: "medium", widthClass: "w-[420px]" },
    { label: "Large", value: "large", widthClass: "w-[640px]" },
    { label: "Full", value: "full", widthClass: "w-full" },
  ];

  const alignments = [
    { label: "Left", value: "left", icon: AlignLeft },
    { label: "Center", value: "center", icon: AlignCenter },
    { label: "Right", value: "right", icon: AlignRight },
  ];

  // Map width values
  const currentSizeObj = sizes.find(s => s.value === width) || sizes[1]; // default medium
  let sizeClass = currentSizeObj.widthClass;
  if (/^\d+/.test(width)) {
    sizeClass = `w-[${width}px]`;
  }

  // Handle replace image upload
  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const formData = new FormData();
      formData.append("documentId", noteId);
      formData.append("fileName", file.name);
      formData.append("mimeType", file.type);
      formData.append("base64Data", base64);

      startTransition(async () => {
        const res = await uploadAttachmentAction(formData);
        if (res.attachmentId && !res.error) {
          onUpdate({ src: `/api/attachments/${res.attachmentId}`, alt: file.name });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const isBase64 = src.startsWith("data:image/");

  return (
    <div
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Only lose focus if we aren't moving focus inside the block itself
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
      className={cn(
        "relative group my-8 clear-both select-none transition-all duration-200",
        alignment === "left" && "float-left mr-6 mb-4",
        alignment === "right" && "float-right ml-6 mb-4",
        alignment === "center" && "mx-auto flex flex-col items-center"
      )}
      style={{
        maxWidth: "100%",
        display: alignment === "center" ? "flex" : "block",
      }}
    >
      {/* Visual Block Frame */}
      <div 
        className={cn(
          "relative rounded-xl overflow-hidden border border-border/40 bg-secondary/10 shadow-sm transition-all duration-200",
          sizeClass,
          isFocused ? "ring-2 ring-primary ring-offset-2" : "hover:border-border/80"
        )}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-15">
            <span className="text-xs font-bold text-muted-foreground animate-pulse">Uploading replacement...</span>
          </div>
        )}

        {/* Legacy base64 banner warning */}
        {isBase64 && (
          <div className="bg-amber-500/10 border-b border-amber-500/25 px-3 py-2 flex items-center justify-between gap-2 z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Legacy image</span>
              <span className="text-[9px] text-amber-700/80 font-medium">This image uses an older storage format.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                // Trigger one-click upload
                const canvas = document.createElement("canvas");
                const img = new Image();
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext("2d");
                  ctx?.drawImage(img, 0, 0);
                  const dataUrl = canvas.toDataURL("image/png");
                  const formData = new FormData();
                  formData.append("documentId", noteId);
                  formData.append("fileName", "migrated-image.png");
                  formData.append("mimeType", "image/png");
                  formData.append("base64Data", dataUrl);
                  
                  startTransition(async () => {
                    const res = await uploadAttachmentAction(formData);
                    if (res.attachmentId && !res.error) {
                      onUpdate({ src: `/api/attachments/${res.attachmentId}` });
                    }
                  });
                };
                img.src = src;
              }}
              className="text-[9px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded shadow-xs transition-colors shrink-0"
            >
              Convert to attachment
            </button>
          </div>
        )}

        {/* Image element */}
        {src === "" && alt.startsWith("Uploading") ? (
          <div className="flex flex-col items-center justify-center p-8 bg-secondary/20 min-h-[180px] text-center gap-2">
            <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-foreground mt-1">{alt}</span>
            <span className="text-[10px] text-muted-foreground">Persisting your media to attachment storage...</span>
          </div>
        ) : src === "" && (alt.startsWith("Upload Failed") || alt.includes("Failed")) ? (
          <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/10 min-h-[180px] text-center gap-2">
            <span className="text-destructive font-bold text-sm">⚠️ Upload Failed</span>
            <span className="text-xs text-muted-foreground font-medium">{alt}</span>
            <button
              type="button"
              onClick={onDelete}
              className="text-[10px] font-bold text-destructive hover:underline mt-2"
            >
              Remove Block
            </button>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
            alt={alt}
            className="w-full h-auto object-cover max-h-[500px] block cursor-pointer"
            onClick={() => setIsFocused(true)}
          />
        )}

        {/* Floating Toolbar inside Group Hover */}
        {src !== "" && (
          <div 
            className={cn(
              "absolute top-2 left-1/2 -translate-x-1/2 z-20 hidden items-center gap-1.5 bg-background border border-border/80 shadow-lg rounded-lg p-1 animate-in fade-in zoom-in-95 duration-100",
              (isFocused || isUploading) ? "flex" : "group-hover:flex"
            )}
          >
            {/* Replace Button */}
            <button
              type="button"
              title="Replace Image"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleReplaceFile}
              className="hidden"
            />

            <div className="h-4 w-px bg-border/40 mx-0.5" />

            {/* Sizing presets */}
            <div className="flex items-center gap-0.5">
              {sizes.map(size => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => onUpdate({ width: size.value })}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold transition-all",
                    width === size.value 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-border/40 mx-0.5" />

            {/* Alignment buttons */}
            <div className="flex items-center gap-0.5">
              {alignments.map(align => {
                const Icon = align.icon;
                return (
                  <button
                    key={align.value}
                    type="button"
                    title={align.label}
                    onClick={() => onUpdate({ alignment: align.value })}
                    className={cn(
                      "p-1 rounded transition-all",
                      alignment === align.value 
                        ? "bg-secondary text-foreground" 
                        : "hover:bg-secondary text-muted-foreground/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-border/40 mx-0.5" />

            {/* Delete Button */}
            <button
              type="button"
              title="Delete Image Block"
              onClick={onDelete}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Caption edit field */}
      <div className={cn(
        "mt-1.5 text-center w-full",
        alignment === "center" ? "max-w-md" : "max-w-full"
      )}>
        <input
          type="text"
          value={alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Write a caption..."
          className="text-xs text-center bg-transparent border-b border-transparent hover:border-border/30 focus:border-primary/50 text-muted-foreground/80 outline-none w-full px-2 py-0.5 transition-all font-medium"
        />
      </div>
    </div>
  );
}
