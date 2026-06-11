import { useState, useCallback } from "react";

export function useDocumentHistory(initialContent: string) {
  const [content, setContent] = useState(initialContent);
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const setContentWithHistory = useCallback(
    (newContent: string | ((prev: string) => string)) => {
      setContent((prev) => {
        const resolved = typeof newContent === "function" ? newContent(prev) : newContent;
        if (resolved === prev) return prev;

        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          newHistory.push(resolved);
          if (newHistory.length > 50) newHistory.shift();
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
        return resolved;
      });
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  return {
    content,
    setContent,
    setContentWithHistory,
    undo,
    redo,
    historyIndex,
    historyLength: history.length,
    setHistory,
    setHistoryIndex
  };
}
