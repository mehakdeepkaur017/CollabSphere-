import { useEffect } from "react";

interface KeyboardShortcutOptions {
  onNewTask?: () => void;
  onNewProject?: () => void;
  onSearch?: () => void;
  onDelete?: () => void;
}

export function useProjectKeyboardShortcuts(options: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "n":
        case "N":
          e.preventDefault();
          options.onNewTask?.();
          break;
        case "p":
        case "P":
          e.preventDefault();
          options.onNewProject?.();
          break;
        case "/":
          e.preventDefault();
          options.onSearch?.();
          break;
        case "Delete":
        case "Backspace":
          options.onDelete?.();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [options]);
}
