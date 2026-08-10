import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useI18n } from "@/hooks/use-i18n";
import { toast } from "sonner";
import { Heart, Eye } from "lucide-react";
import { ProductImageViewer } from "@/components/ProductImageViewer";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { t } = useI18n();
  const [viewerOpen, setViewerOpen] = useState(false);
  const soldOut = !!product.soldOut;
  const liked = has(product.id);
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="group">
      <div className="relative mb-5 aspect-[3/4] overflow-hidden bg-stone">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-90 ${soldOut ? "opacity-60" : ""}`}
        />
        {soldOut && (
          <span className="absolute left-3 top-3 bg-ink px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-marble">
            {t("card.soldOut")}
          </span>
        )}

        {/* Top-right action stack */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => {
              toggle({ id: product.id, name: product.name, price: product.price, image: product.image });
              toast.success(liked ? t("card.removedFromWishlist") : t("card.savedToWishlist"), { description: product.name });
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:scale-110 hover:bg-background"
          >
            <Heart className={`h-4 w-4 transition ${liked ? "fill-red-500 text-red-500" : "text-ink"}`} />
          </button>

          <button
            type="button"
            aria-label={t("card.viewImage")}
            onClick={() => setViewerOpen(true)}
            className="flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-ink hover:text-marble group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {!soldOut && (
          <button
            onClick={() => {
              add({ id: product.id, name: product.name, price: product.price, image: product.image });
              toast.success(t("card.addedToBag"), { description: product.name });
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-3 bg-background px-6 py-3 text-[10px] uppercase tracking-[0.2em] opacity-0 shadow-sm transition-all duration-300 hover:bg-ink hover:text-marble group-hover:translate-y-0 group-hover:opacity-100"
          >
            {t("card.quickAdd")}
          </button>
        )}
      </div>
      <p className="eyebrow mb-1">{product.tagline}</p>
      <h4 className="text-sm font-medium tracking-tight">{product.name}</h4>
      <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">{formatPrice(product.price)}</p>

      <ProductImageViewer
        open={viewerOpen}
        images={gallery}
        name={product.name}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
