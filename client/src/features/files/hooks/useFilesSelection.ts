import { useState, useCallback } from "react";

export function useFilesSelection<T extends { _id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const toggleSelection = useCallback(
    (id: string, multi: boolean, range: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (range && lastSelectedId) {
          // Range selection (Shift + Click)
          const lastIndex = items.findIndex((i) => i._id === lastSelectedId);
          const currentIndex = items.findIndex((i) => i._id === id);

          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);

            if (!multi) next.clear(); // If not ctrl+shift, clear previous selection

            for (let i = start; i <= end; i++) {
              next.add(items[i]._id);
            }
          }
        } else if (multi) {
          // Toggle single item (Ctrl + Click)
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        } else {
          // Single select (Normal Click)
          next.clear();
          next.add(id);
        }

        return next;
      });

      setLastSelectedId(id);
    },
    [items, lastSelectedId]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((i) => i._id)));
  }, [items]);

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    selectAll,
  };
}
