"use client";

import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type ImageToolbarProps = {
  selectedImage: {
    src: string;
    alt: string;
    width: string;
    alignment: string;
    rect: { top: number; left: number; width: number; height: number } | null;
  };
  onClose: () => void;
  onUpdateImage: (alt: string, width: string, alignment: string) => void;
};

export function ImageToolbar({ selectedImage, onClose, onUpdateImage }: ImageToolbarProps) {
  const presets = [
    { label: "Small (240px)", value: "small" },
    { label: "Medium (420px)", value: "medium" },
    { label: "Large (640px)", value: "large" },
    { label: "Full (100%)", value: "full" },
  ];

  const alignments = [
    { value: "left", icon: AlignLeft, label: "Left" },
    { value: "center", icon: AlignCenter, label: "Center" },
    { value: "right", icon: AlignRight, label: "Right" },
  ];

  // Compute positions dynamically under the image
  const toolbarStyle: React.CSSProperties = selectedImage.rect
    ? {
        position: "fixed",
        top: `${selectedImage.rect.top + selectedImage.rect.height + 12}px`,
        left: `${selectedImage.rect.left + selectedImage.rect.width / 2}px`,
        transform: "translateX(-50%)",
      }
    : {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
      };

  return (
    <div
      style={toolbarStyle}
      className="z-50 animate-in slide-in-from-top-2 duration-200 w-max max-w-lg"
    >
      <div className="bg-popover border border-border/80 shadow-2xl rounded-xl p-3 flex items-center gap-3.5 bg-background/95 backdrop-blur-md">
        {/* Caption */}
        <div className="flex flex-col gap-1 shrink-0">
          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-0.5">
            Caption
          </label>
          <input
            type="text"
            value={selectedImage.alt}
            onChange={(e) => onUpdateImage(e.target.value, selectedImage.width, selectedImage.alignment)}
            placeholder="Image caption..."
            className="text-xs bg-secondary/35 border border-border/30 rounded-md px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-primary/50 w-36 transition-colors text-foreground"
          />
        </div>

        <div className="h-8 w-px bg-border/40" />

        {/* Size Presets */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-0.5">
            Size Preset
          </span>
          <div className="flex items-center gap-1">
            {presets.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => onUpdateImage(selectedImage.alt, size.value, selectedImage.alignment)}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all duration-150",
                  selectedImage.width === size.value
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {size.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="h-8 w-px bg-border/40" />

        {/* Alignments */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-0.5">
            Alignment
          </span>
          <div className="flex items-center gap-1 bg-secondary/20 p-0.5 rounded-md border border-border/30">
            {alignments.map((align) => {
              const Icon = align.icon;
              return (
                <button
                  key={align.value}
                  type="button"
                  title={align.label}
                  onClick={() => onUpdateImage(selectedImage.alt, selectedImage.width, align.value)}
                  className={cn(
                    "p-1.5 rounded-sm transition-all duration-150",
                    selectedImage.alignment === align.value
                      ? "bg-background shadow-xs text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-secondary/60 text-muted-foreground transition-colors self-end mt-3"
          title="Deselect image"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
