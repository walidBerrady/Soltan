import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | undefined>(undefined);

const STORAGE_KEY = "aurelia_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (item) =>
    setItems((curr) => {
      const found = curr.find((i) => i.id === item.id);
      if (found) return curr.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...curr, { ...item, quantity: 1 }];
    });

  const remove: CartCtx["remove"] = (id) => setItems((c) => c.filter((i) => i.id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((c) =>
      qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return <Ctx.Provider value={{ items, count, total, add, remove, setQty, clear }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
