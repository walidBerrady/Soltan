import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import catDresses from "@/assets/cat-dresses.jpg";
import catBags from "@/assets/cat-bags.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import catJewelry from "@/assets/cat-jewelry.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/products";
import { useProducts } from "@/hooks/use-products";
import { useI18n } from "@/hooks/use-i18n";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/")({
  component: Index,
});

const CAT_IMAGES = [
  { key: "cat.dresses", img: catDresses, no: "01" },
  { key: "cat.bags", img: catBags, no: "02" },
  { key: "cat.shoes", img: catShoes, no: "03" },
  { key: "cat.jewelry", img: catJewelry, no: "04" },
];

function Index() {
  const { products } = useProducts();
  const { t } = useI18n();
  const catalogMax = useMemo(() => (products.length ? Math.max(...products.map((p) => p.price)) : 0), [products]);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  useEffect(() => {
    setMaxPrice(catalogMax);
  }, [catalogMax]);

  const filtered = useMemo(
    () => products.filter((p) => p.price <= maxPrice),
    [products, maxPrice]
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="px-6 pb-20 pt-4 md:px-10">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone md:aspect-[21/9]">
          <img
            src={heroImg}
            alt="Soltan summer collection"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/15 px-6 text-center text-white">
            <span className="text-[10px] uppercase tracking-[0.4em]">{t("home.eyebrow")}</span>
            <h1 className="mt-4 max-w-2xl font-serif text-3xl italic leading-tight md:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <a
              href="#products"
              className="mt-8 inline-block bg-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-white"
            >
              {t("home.cta")}
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-border/40 px-6 py-20 md:px-10 md:py-28">
        <div className="mb-12 max-w-md">
          <span className="eyebrow block">{t("home.collections")}</span>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl">{t("home.shopByCategory")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {CAT_IMAGES.map((c) => (
            <a key={c.key} href="#products" className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-stone">
                <img
                  src={c.img}
                  alt={t(c.key)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-serif text-xl">{t(c.key)}</h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.no}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section id="products" className="border-t border-border/40 bg-muted/40 px-6 py-20 md:px-10 md:py-28">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <span className="eyebrow block">{t("home.curatedRoom")}</span>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">{t("home.essentials")}</h2>
          </div>
          <Link to="/cart" className="hidden border-b border-ink pb-1 text-[10px] uppercase tracking-[0.2em] md:inline-block">
            {t("home.viewBag")}
          </Link>
        </div>

        {/* Price filter */}
        <div className="mb-10 flex flex-col gap-5 border-y border-border py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="eyebrow">{t("home.filterByPrice")}</span>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {t("home.upTo")} <span className="text-ink">{formatPrice(maxPrice)}</span>
            </p>
          </div>
          <Slider
            value={[maxPrice]}
            min={0}
            max={catalogMax || 1}
            step={50}
            onValueChange={(v) => setMaxPrice(v[0] ?? 0)}
            className="w-full"
          />
          <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span>{formatPrice(0)}</span>
            <button
              type="button"
              onClick={() => setMaxPrice(catalogMax)}
              className="border-b border-ink pb-0.5 text-[10px] uppercase tracking-[0.2em] text-ink hover:opacity-70"
            >
              {t("home.reset")}
            </button>
            <span>{formatPrice(catalogMax)}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t("home.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-8 md:gap-y-16">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border/40 px-6 py-12 md:px-10">
        <div className="flex flex-col items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Soltan</p>
          <p>{t("footer.made")}</p>
        </div>
      </footer>
    </div>
  );
}
