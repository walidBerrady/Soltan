import { Link } from "@tanstack/react-router";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Heart, ShoppingBag, Languages } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function getInitial(user: { email?: string | null; user_metadata?: { full_name?: string } } | null) {
  if (!user) return "?";
  const name = (user.user_metadata?.full_name || "").trim();
  if (name) return name.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "?";
}

const navLinkClass =
  "relative inline-flex items-center text-[10px] uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-ink after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100";

const iconBtnClass =
  "group/btn relative inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 text-[10px] uppercase tracking-[0.2em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-marble hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]";

export function SiteHeader() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const { t, toggle: toggleLang, lang } = useI18n();

  const fullName = (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? "";
  const initial = getInitial(user);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-10">
        <div className="hidden items-center gap-7 md:flex">
          <Link to="/" className={navLinkClass}>{t("nav.shop")}</Link>
          {isAdmin && (
            <>
              <Link to="/admin" className={navLinkClass}>{t("nav.orders")}</Link>
              <Link to="/admin-products" className={navLinkClass}>{t("nav.products")}</Link>
            </>
          )}
        </div>

        <Link
          to="/"
          className="font-serif text-2xl italic tracking-tight transition-opacity hover:opacity-70 md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          Soltan
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            className={iconBtnClass}
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-mono">{lang === "en" ? "ع" : "EN"}</span>
          </button>

          {user ? (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  aria-label="Profile"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-serif text-sm text-marble shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]"
                >
                  {initial}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background font-serif text-2xl">
                    {initial}
                  </div>
                  <DialogTitle className="text-center font-serif text-xl italic">
                    {fullName || t("nav.account")}
                  </DialogTitle>
                  <DialogDescription className="text-center normal-case tracking-normal">
                    {user.email}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full" onClick={() => signOut()}>
                      {t("nav.logout")}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Link to="/auth" className={iconBtnClass}>
              {t("nav.signin")}
            </Link>
          )}

          <Link to="/wishlist" className={iconBtnClass} aria-label="Wishlist">
            <Heart className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
            <span className="font-mono tabular-nums">{wishCount}</span>
          </Link>

          <Link to="/cart" className={iconBtnClass} aria-label="Cart">
            <ShoppingBag className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
            <span className="font-mono tabular-nums">{count}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
