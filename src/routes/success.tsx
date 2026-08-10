import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Soltan" },
      { name: "description", content: "Your order has been placed." },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <span className="eyebrow">{t("ok.confirmation")}</span>
        <h1 className="mt-4 font-serif text-5xl italic md:text-6xl">{t("ok.thanks")}</h1>
        <p className="mt-6 max-w-md text-muted-foreground">
          {t("ok.received")}
        </p>
        <Link
          to="/"
          className="mt-10 inline-block bg-ink px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-marble hover:opacity-90"
        >
          {t("ok.continue")}
        </Link>
      </main>
    </div>
  );
}
