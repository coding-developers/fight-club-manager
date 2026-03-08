import { useState, useCallback } from "react";

/**
 * Generic CRUD state hook - manages list + form state for any entity.
 * Replace localStorage logic with API calls when backend is ready.
 */
export function useCrudState<T extends { id: string }>(storageKey: string) {
  const [items, setItems] = useState<T[]>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const persist = (data: T[]) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setItems(data);
  };

  const create = useCallback((item: T) => {
    const updated = [...items, item];
    persist(updated);
  }, [items, storageKey]);

  const update = useCallback((item: T) => {
    const updated = items.map((i) => (i.id === item.id ? item : i));
    persist(updated);
  }, [items, storageKey]);

  const remove = useCallback((id: string) => {
    const updated = items.filter((i) => i.id !== id);
    persist(updated);
  }, [items, storageKey]);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(false);
  }, []);

  return {
    items,
    editingItem,
    isFormOpen,
    create,
    update,
    remove,
    openCreate,
    openEdit,
    closeForm,
  };
}
