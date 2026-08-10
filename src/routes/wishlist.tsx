import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useI18n } from "@/hooks/use-i18n";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Soltan" },
      { name: "description", content: "Items you saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const { add } = useCart();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
        <span className="eyebrow">{t("wish.eyebrow")}</span>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">{t("wish.title")}</h1>

        {items.length === 0 ? (
          <div className="mt-16 border-t border-border pt-16 text-center">
            <p className="text-muted-foreground">{t("wish.empty")}</p>
            <Link to="/" className="mt-6 inline-block border-b border-ink pb-1 text-[10px] uppercase tracking-[0.2em]">
              {t("cart.continue")}
            </Link>
          </div>
        ) : (
          <ul className="mt-12 divide-y divide-border border-y border-border">
            {items.map((i) => (
              <li key={i.id} className="flex gap-5 py-6">
                <img src={i.image} alt={i.name} className="h-32 w-24 object-cover" loading="lazy" />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{i.name}</h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{formatPrice(i.price)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        add({ id: i.id, name: i.name, price: i.price, image: i.image });
                        toast.success(t("card.addedToBag"), { description: i.name });
                      }}
                      className="bg-ink px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-marble hover:opacity-90"
                    >
                      {t("wish.moveToBag")}
                    </button>
                    <button
                      onClick={() => remove(i.id)}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
                    >
                      <Heart className="h-3 w-3 fill-red-500 text-red-500" /> {t("cart.remove")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <button
            onClick={clear}
            className="mt-8 border-b border-ink pb-1 text-[10px] uppercase tracking-[0.2em] hover:opacity-70"
          >
            {t("wish.clear")}
          </button>
        )}
      </main>
    </div>
  );
}
