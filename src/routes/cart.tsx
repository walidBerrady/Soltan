import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Soltan" },
      { name: "description", content: "Review the items in your shopping bag and check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  // initialize/refresh selection: default all checked
  const selectedItems = items.filter((i) => selected[i.id] !== false);
  const selectedTotal = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const selectedCount = selectedItems.reduce((s, i) => s + i.quantity, 0);

  function toggleOne(id: string) {
    setSelected((s) => ({ ...s, [id]: s[id] === false ? true : false }));
  }
  function toggleAll(check: boolean) {
    const next: Record<string, boolean> = {};
    items.forEach((i) => (next[i.id] = check));
    setSelected(next);
  }

  function isValidMoroccanPhone(value: string) {
    const cleaned = value.replace(/[\s-]/g, "");
    return /^(?:\+212\d{9}|0\d{9})$/.test(cleaned);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to checkout.");
      return;
    }
    if (!user) {
      toast.error("Please sign in to checkout.");
      navigate({ to: "/auth" });
      return;
    }
    if (!fullName.trim() || !location.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!isValidMoroccanPhone(phone)) {
      toast.error("Phone number must start with +212 or 0.", {
        description: "Example: +212612345678 or 0612345678",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: {
          products: selectedItems.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          shipping: {
            phone: phone.trim(),
            location: location.trim(),
            notes: notes.trim() || null,
          },
        },
        total: Number(selectedTotal.toFixed(2)),
        item_count: selectedCount,
        customer_name: fullName.trim(),
        customer_email: email.trim() || null,
      };
      const { error } = await supabase.from("orders").insert(payload);
      if (error) throw error;
      // remove only the items checked out
      selectedItems.forEach((i) => remove(i.id));
      toast.success("Order placed", { description: "Thank you for your purchase." });
      navigate({ to: "/success" });
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong placing your order.", {
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
        <span className="eyebrow">{t("cart.checkout")}</span>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">{t("cart.title")}</h1>

        {items.length === 0 ? (
          <div className="mt-16 border-t border-border pt-16 text-center">
            <p className="text-muted-foreground">{t("cart.empty")}</p>
            <Link
              to="/"
              className="mt-6 inline-block border-b border-ink pb-1 text-[10px] uppercase tracking-[0.2em]"
            >
              {t("cart.continue")}
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 md:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedItems.length === items.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="h-4 w-4 accent-foreground"
                  />
                  {t("cart.selectAll")} ({selectedItems.length}/{items.length})
                </label>
                <button onClick={clear} className="hover:text-ink">{t("cart.clear")}</button>
              </div>
              <ul className="divide-y divide-border border-y border-border">
                {items.map((i) => {
                  const isOn = selected[i.id] !== false;
                  return (
                    <li key={i.id} className="flex gap-4 py-6">
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => toggleOne(i.id)}
                        className="mt-2 h-4 w-4 shrink-0 accent-foreground"
                        aria-label={`Include ${i.name} in checkout`}
                      />
                      <img src={i.image} alt={i.name} className={`h-32 w-24 object-cover ${isOn ? "" : "opacity-50"}`} loading="lazy" />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{i.name}</h3>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{formatPrice(i.price)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <button onClick={() => setQty(i.id, i.quantity - 1)} className="px-3 py-1 text-sm hover:bg-muted">−</button>
                            <span className="px-4 text-sm tabular-nums">{i.quantity}</span>
                            <button onClick={() => setQty(i.id, i.quantity + 1)} className="px-3 py-1 text-sm hover:bg-muted">+</button>
                          </div>
                          <button
                            onClick={() => remove(i.id)}
                            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
                          >
                            {t("cart.remove")}
                          </button>
                        </div>
                      </div>
                      <p className="font-mono text-sm tabular-nums">{formatPrice(i.price * i.quantity)}</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="h-fit border border-border bg-card p-6">
              <h2 className="font-serif text-xl">{t("cart.summary")}</h2>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {selectedCount} {selectedCount === 1 ? t("cart.itemSelected") : t("cart.itemsSelected")}
              </p>
              <div className="mt-6 flex justify-between border-t border-border pt-4 text-sm">
                <span>{t("cart.subtotal")}</span>
                <span className="font-mono tabular-nums">{formatPrice(selectedTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>{t("cart.shipping")}</span>
                <span>{t("cart.calculatedNext")}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-medium">
                <span>{t("cart.total")}</span>
                <span className="font-mono tabular-nums">{formatPrice(selectedTotal)}</span>
              </div>

              <form onSubmit={handleCheckout} className="mt-6 space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t("cart.fullName")} <span className="text-ink">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t("cart.location")} <span className="text-ink">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder={t("cart.locationPh")}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t("cart.phone")} <span className="text-ink">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    pattern="^(?:\+212|0)\d{9}$"
                    placeholder="+212612345678 or 0612345678"
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">{t("cart.phoneHint")}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="w-full border-b border-border pb-2 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
                >
                  {showMore ? t("cart.hideDetails") : t("cart.moreDetails")}
                </button>

                {showMore && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {t("cart.email")}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {t("cart.notes")}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder={t("cart.notesPh")}
                        className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || selectedItems.length === 0}
                  className="w-full bg-ink py-4 text-[10px] uppercase tracking-[0.2em] text-marble transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting
                    ? t("cart.placing")
                    : selectedItems.length === 0
                      ? t("cart.selectToCheckout")
                      : `${t("cart.checkoutBtn")} ${selectedCount} ${selectedCount === 1 ? t("cart.itemSelected") : t("cart.itemsSelected")}`}
                </button>
              </form>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
