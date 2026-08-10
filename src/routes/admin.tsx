import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Orders" },
      { name: "description", content: "View all customer orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type OrderItem = { id: string; name: string; price: number; quantity: number };
type Shipping = { phone?: string | null; location?: string | null; notes?: string | null };
type ItemsPayload = OrderItem[] | { products: OrderItem[]; shipping?: Shipping };
type OrderStatus = "pending" | "accepted" | "delivered";
type Order = {
  id: string;
  items: ItemsPayload;
  total: number;
  item_count: number;
  customer_name: string | null;
  customer_email: string | null;
  status: OrderStatus;
  created_at: string;
};

function getProducts(items: ItemsPayload): OrderItem[] {
  if (Array.isArray(items)) return items;
  return items?.products ?? [];
}
function getShipping(items: ItemsPayload): Shipping | null {
  if (Array.isArray(items)) return null;
  return items?.shipping ?? null;
}

const TABS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "delivered", label: "Delivered" },
];

function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<OrderStatus>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      return;
    }
    setOrders((data ?? []).map((o) => ({ ...o, status: (o.status ?? "pending") as OrderStatus })) as unknown as Order[]);
    setError(null);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      await fetchOrders();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [authLoading, isAdmin]);

  async function updateStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    setBusyId(null);
    if (error) {
      toast.error("Failed to update", { description: error.message });
      return;
    }
    toast.success(`Order marked ${status}`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setBusyId(id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    setBusyId(null);
    if (error) {
      toast.error("Failed to delete", { description: error.message });
      return;
    }
    toast.success("Order deleted");
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  const counts = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "pending").length,
      accepted: orders.filter((o) => o.status === "accepted").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }),
    [orders]
  );

  const visible = orders.filter((o) => o.status === tab);

  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <span className="eyebrow">Restricted</span>
          <h1 className="mt-4 font-serif text-3xl">Admin Access Only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {user
              ? "Your account doesn't have admin permissions."
              : "Please sign in with the admin account to view orders."}
          </p>
          {!user && (
            <Link
              to="/auth"
              className="mt-8 inline-block bg-ink px-8 py-3 text-[10px] uppercase tracking-[0.2em] text-marble"
            >
              Sign In
            </Link>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1 className="mt-4 font-serif text-4xl md:text-5xl">Orders</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {loading ? "Loading…" : `${orders.length} order${orders.length === 1 ? "" : "s"} total`}
            </p>
          </div>
          <Link to="/admin-products" className="border-b border-ink pb-1 text-[10px] uppercase tracking-[0.2em]">
            Products →
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-1 border-b border-border">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 px-4 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                {t.label}
                <span className="ml-2 font-mono text-[10px] tabular-nums text-muted-foreground">
                  ({counts[t.key]})
                </span>
              </button>
            );
          })}
        </div>

        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

        {!loading && visible.length === 0 && !error && (
          <p className="mt-12 border-t border-border pt-12 text-center text-muted-foreground">
            No {tab} orders.
          </p>
        )}

        <div className="mt-10 space-y-6">
          {visible.map((o) => {
            const shipping = getShipping(o.items);
            const products = getProducts(o.items);
            const isBusy = busyId === o.id;
            return (
              <article key={o.id} className="border border-border bg-card p-6">
                <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                    <h2 className="mt-1 font-serif text-lg">
                      {o.customer_name || "Guest"}
                      {o.customer_email && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">{o.customer_email}</span>
                      )}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-base tabular-nums">{formatPrice(Number(o.total))}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                </header>

                <ul className="mt-4 space-y-2 text-sm">
                  {products.map((it, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>
                        {it.name} <span className="text-muted-foreground">× {it.quantity}</span>
                      </span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {formatPrice(it.price * it.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                {shipping && (
                  <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:grid-cols-3">
                    {shipping.phone && <p><span className="eyebrow mr-2">Phone</span>{shipping.phone}</p>}
                    {shipping.location && <p><span className="eyebrow mr-2">Location</span>{shipping.location}</p>}
                    {shipping.notes && (
                      <p className="sm:col-span-3"><span className="eyebrow mr-2">Notes</span>{shipping.notes}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  {o.status === "pending" && (
                    <button
                      disabled={isBusy}
                      onClick={() => updateStatus(o.id, "accepted")}
                      className="bg-ink px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-marble transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Accept
                    </button>
                  )}
                  {o.status === "accepted" && (
                    <button
                      disabled={isBusy}
                      onClick={() => updateStatus(o.id, "delivered")}
                      className="bg-ink px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-marble transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {o.status !== "pending" && (
                    <button
                      disabled={isBusy}
                      onClick={() => updateStatus(o.id, "pending")}
                      className="border border-border px-5 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted disabled:opacity-50"
                    >
                      Move to Pending
                    </button>
                  )}
                  <button
                    disabled={isBusy}
                    onClick={() => deleteOrder(o.id)}
                    className="ml-auto border border-border px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
