/**
 * Converts markdown text to HTML for rendering inside .ordo-prose containers.
 * Uses standard HTML attributes (class=, not className=) since output goes
 * into dangerouslySetInnerHTML → real DOM, not React VDOM.
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split("\n");
  const output: string[] = [];
  let checkboxCount = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code blocks: ```...```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(
          lines[i]
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        );
        i++;
      }
      const langAttr = lang ? ` data-lang="${lang}"` : "";
      output.push(
        `<pre${langAttr}><code>${codeLines.join("\n")}</code></pre>`
      );
      i++; // skip closing ```
      continue;
    }

    // Blockquote: > text
    if (line.startsWith("> ")) {
      const blockLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        blockLines.push(applyInline(lines[i].slice(2)));
        i++;
      }
      output.push(`<blockquote>${blockLines.join("<br>")}</blockquote>`);
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) { 
      const rawText = h3[1].replace(/[\[\]*`]/g, '').trim();
      const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      output.push(`<h3 id="${id}">${applyInline(h3[1])}</h3>`); 
      i++; 
      continue; 
    }
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) { 
      const rawText = h2[1].replace(/[\[\]*`]/g, '').trim();
      const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      output.push(`<h2 id="${id}">${applyInline(h2[1])}</h2>`); 
      i++; 
      continue; 
    }
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) { 
      const rawText = h1[1].replace(/[\[\]*`]/g, '').trim();
      const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      output.push(`<h1 id="${id}">${applyInline(h1[1])}</h1>`); 
      i++; 
      continue; 
    }

    // Unordered list (including checklists)
    if (line.match(/^[-*]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        const raw = lines[i].replace(/^[-*]\s/, "");
        const checkboxDone = raw.match(/^\[x\]\s+(.+)$/i);
        const checkboxEmpty = raw.match(/^\[\s\]\s+(.+)$/);
        if (checkboxDone) {
          listItems.push(
            `<li class="ordo-checklist-item ordo-checklist-done"><input type="checkbox" checked data-checkbox-idx="${checkboxCount++}" class="ordo-interactive-checkbox cursor-pointer" aria-label="done"><span>${applyInline(checkboxDone[1])}</span></li>`
          );
        } else if (checkboxEmpty) {
          listItems.push(
            `<li class="ordo-checklist-item"><input type="checkbox" data-checkbox-idx="${checkboxCount++}" class="ordo-interactive-checkbox cursor-pointer" aria-label="pending"><span>${applyInline(checkboxEmpty[1])}</span></li>`
          );
        } else {
          listItems.push(`<li>${applyInline(raw)}</li>`);
        }
        i++;
      }
      output.push(`<ul>${listItems.join("")}</ul>`);
      continue;
    }

    // Ordered list: 1. item
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const raw = lines[i].replace(/^\d+\.\s/, "");
        listItems.push(`<li>${applyInline(raw)}</li>`);
        i++;
      }
      output.push(`<ol>${listItems.join("")}</ol>`);
      continue;
    }

    // Tables: lines containing |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.trim().startsWith("|") && nextLine.trim().endsWith("|") && nextLine.includes("-")) {
        const headerRow = line;
        const separatorRow = nextLine;
        
        const headers = headerRow.split("|").slice(1, -1).map(cell => cell.trim());
        
        const alignments = separatorRow.split("|").slice(1, -1).map(cell => {
          const trimmed = cell.trim();
          const left = trimmed.startsWith(":");
          const right = trimmed.endsWith(":");
          if (left && right) return "center";
          if (right) return "right";
          return "left";
        });
        
        const tableRowsHtml: string[] = [];
        
        const headerCellsHtml = headers.map((header, idx) => {
          const align = alignments[idx] || "left";
          return `<th style="text-align: ${align}; border: 1px solid rgba(120, 120, 120, 0.15); padding: 0.5rem 1rem; font-weight: bold; background: rgba(120, 120, 120, 0.05);">${applyInline(header)}</th>`;
        });
        tableRowsHtml.push(`<thead><tr>${headerCellsHtml.join("")}</tr></thead>`);
        
        i += 2;
        
        const bodyRowsHtml: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          const cells = lines[i].split("|").slice(1, -1).map(cell => cell.trim());
          const cellsHtml = cells.map((cell, idx) => {
            const align = alignments[idx] || "left";
            return `<td style="text-align: ${align}; border: 1px solid rgba(120, 120, 120, 0.15); padding: 0.5rem 1rem;">${applyInline(cell)}</td>`;
          });
          bodyRowsHtml.push(`<tr>${cellsHtml.join("")}</tr>`);
          i++;
        }
        
        output.push(`<div style="overflow-x: auto; margin: 1rem 0;"><table style="width: 100%; border-collapse: collapse; font-size: 13px;">${tableRowsHtml.join("")}<tbody>${bodyRowsHtml.join("")}</tbody></table></div>`);
        continue;
      }
    }

    // Horizontal rule: ---
    if (line.trim() === "---" || line.trim() === "***") {
      output.push("<hr>");
      i++;
      continue;
    }

    // Empty line → paragraph break (no tag, just spacing via CSS)
    if (line.trim() === "") {
      output.push('<div class="ordo-spacer"></div>');
      i++;
      continue;
    }

    // Plain paragraph line
    output.push(`<p>${applyInline(line)}</p>`);
    i++;
  }

  return output.join("\n");
}

/** Apply inline formatting: bold, italic, code, links, images */
function applyInline(text: string): string {
  text = escapeHtml(text);

  // Images: ![alt](src) or ![alt|size|alignment](src)
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]*)\)/g,
    (_match, altFull, src) => {
      const parts = altFull.split('|').map((s: string) => s.trim());
      const alt = parts[0] || "";
      const safeSrc = sanitizeUrl(src, { allowImages: true });

      if (!safeSrc) {
        return `<span class="text-destructive text-xs font-semibold">[Unsupported image URL]</span>`;
      }

      let widthStyle = "";
      let alignmentClass = "";
      let alignmentStyle = "";

      // Extract modifiers
      const modifiers = parts.slice(1).map((s: string) => s.toLowerCase());
      modifiers.forEach((mod: string) => {
        if (mod === "small" || mod === "240" || mod === "240px") {
          widthStyle = "width: 240px;";
        } else if (mod === "medium" || mod === "420" || mod === "420px") {
          widthStyle = "width: 420px;";
        } else if (mod === "large" || mod === "640" || mod === "640px") {
          widthStyle = "width: 640px;";
        } else if (mod === "full" || mod === "100%") {
          widthStyle = "width: 100%;";
        } else if (/^\d+$/.test(mod)) {
          widthStyle = `width: ${mod}px;`;
        } else if (mod === "left" || mod === "center" || mod === "right") {
          if (mod === "left") {
            alignmentClass = "ordo-img-left";
            alignmentStyle = "float: left; margin-right: 1.5rem; margin-bottom: 0.5rem; display: block;";
          } else if (mod === "right") {
            alignmentClass = "ordo-img-right";
            alignmentStyle = "float: right; margin-left: 1.5rem; margin-bottom: 0.5rem; display: block;";
          } else if (mod === "center") {
            alignmentClass = "ordo-img-center";
            alignmentStyle = "margin: 1.5rem auto; display: block;";
          }
        }
      });

      // Default visual layout style
      const finalStyle = `max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); ${widthStyle} ${alignmentStyle}`;

      // Old base64 warning wrapper
      const isBase64 = safeSrc.startsWith("data:image/");
      const warningHtml = isBase64
        ? `<div class="relative group my-2 inline-block ${alignmentClass}"><span class="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 select-none">Old Base64 (Needs Re-upload)</span>`
        : "";
      const closingWarningHtml = isBase64 ? `</div>` : "";

      return `${warningHtml}<img src="${escapeAttribute(safeSrc)}" alt="${escapeAttribute(alt)}" style="${escapeAttribute(finalStyle)}" class="ordo-editor-image ${alignmentClass}">${closingWarningHtml}`;
    }
  );

  // Links: [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label, url) => {
      const safeUrl = sanitizeUrl(url);
      if (!safeUrl) {
        return label;
      }

      return `<a href="${escapeAttribute(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
  );

  // Inline code: `code`
  text = text.replace(/`([^`\n]+?)`/g, "<code>$1</code>");

  // Bold: **text**
  text = text.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text* (not **bold**)
  text = text.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  return text;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(value: string, options: { allowImages?: boolean } = {}): string | null {
  const trimmed = value.trim();

  if (trimmed.startsWith("/api/attachments/")) {
    return trimmed;
  }

  if (options.allowImages && /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

/** Extracts headings from markdown for TOC generation */
export function generateTOC(markdown: string): Array<{ level: number; text: string; id: string }> {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const toc: Array<{ level: number; text: string; id: string }> = [];
  
  let inCodeBlock = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    if (inCodeBlock) continue;
    
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2].replace(/[\[\]*`]/g, '').trim(); // very basic strip formatting
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      toc.push({ level, text, id });
    }
  }
  
  return toc;
}

export type Block =
  | { type: "text"; content: string; id: string }
  | { type: "image"; src: string; alt: string; width: string; alignment: string; id: string };

export function parseMarkdownToBlocks(markdown: string): Block[] {
  if (!markdown) return [{ type: "text", content: "", id: "text-start-0" }];
  const imageRegex = /(!\[[^\]]*\]\([^)]*\))/g;
  const parts = markdown.split(imageRegex);
  
  const blocks: Block[] = [];
  let lastImageSrc = "";
  let textIndexAfterImage = 0;
  let startTextIndex = 0;

  parts.forEach((part, idx) => {
    if (idx % 2 === 1) {
      const match = part.match(/!\[([^\]]*)\]\(([^)]*)\)/);
      if (match) {
        const altFull = match[1];
        const src = match[2];
        const partsList = altFull.split('|').map((s: string) => s.trim());
        const alt = partsList[0] || "";
        let width = "medium";
        let alignment = "center";

        const modifiers = partsList.slice(1).map((s: string) => s.toLowerCase());
        modifiers.forEach((mod: string) => {
          if (mod === "small" || mod === "240" || mod === "240px") width = "small";
          else if (mod === "medium" || mod === "420" || mod === "420px") width = "medium";
          else if (mod === "large" || mod === "640" || mod === "640px") width = "large";
          else if (mod === "full" || mod === "100%") width = "full";
          else if (/^\d+$/.test(mod)) width = mod;
          else if (mod === "left" || mod === "center" || mod === "right") alignment = mod;
        });

        lastImageSrc = src;
        textIndexAfterImage = 0;

        blocks.push({
          type: "image",
          src,
          alt,
          width,
          alignment,
          id: `image-${src}`
        });
      }
    } else {
      let id = "";
      if (lastImageSrc) {
        id = `text-after-${lastImageSrc}-${textIndexAfterImage}`;
        textIndexAfterImage++;
      } else {
        id = `text-start-${startTextIndex}`;
        startTextIndex++;
      }

      blocks.push({
        type: "text",
        content: part,
        id
      });
    }
  });

  return blocks;
}

export function serializeBlocksToMarkdown(blocks: Block[]): string {
  return blocks.map((block) => {
    if (block.type === "image") {
      let widthModifier = block.width;
      if (block.width === "small") widthModifier = "240px";
      else if (block.width === "medium") widthModifier = "420px";
      else if (block.width === "large") widthModifier = "640px";
      else if (block.width === "full") widthModifier = "100%";
      return `![${block.alt}|${widthModifier}|${block.alignment}](${block.src})`;
    }
    return block.content;
  }).join("");
}
