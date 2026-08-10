import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type WishlistCtx = {
  items: WishlistItem[];
  count: number;
  has: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<WishlistCtx | undefined>(undefined);
const STORAGE_KEY = "soltan_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const has = (id: string) => items.some((i) => i.id === id);
  const toggle = (item: WishlistItem) =>
    setItems((curr) => (curr.some((i) => i.id === item.id) ? curr.filter((i) => i.id !== item.id) : [...curr, item]));
  const remove = (id: string) => setItems((c) => c.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  return (
    <Ctx.Provider value={{ items, count: items.length, has, toggle, remove, clear }}>{children}</Ctx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
