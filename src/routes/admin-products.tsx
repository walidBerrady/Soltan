import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORIES, formatPrice, type Category } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-products")({
  head: () => ({
    meta: [
      { title: "Admin — Products" },
      { name: "description", content: "Manage shop products." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProductsPage,
});

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  images: string[] | null;
  tagline: string | null;
  sold_out: boolean;
  sort_order: number;
  created_at: string;
};

type FormState = {
  id?: string;
  name: string;
  category: Category;
  price: string;
  tagline: string;
  sold_out: boolean;
  image_url: string;
  images: string[];
};

const EMPTY: FormState = {
  name: "",
  category: "Dresses",
  price: "",
  tagline: "",
  sold_out: false,
  image_url: "",
  images: [],
};

function AdminProductsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchRows() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load", { description: error.message });
      return;
    }
    setRows((data ?? []) as ProductRow[]);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchRows().finally(() => setLoading(false));
  }, [authLoading, isAdmin]);

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(false);
    if (error) {
      toast.error("Upload failed", { description: error.message });
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  function resetForm() {
    setForm(EMPTY);
  }

  function editRow(r: ProductRow) {
    setForm({
      id: r.id,
      name: r.name,
      category: r.category as Category,
      price: String(r.price),
      tagline: r.tagline ?? "",
      sold_out: r.sold_out,
      image_url: r.image_url,
      images: (r.images ?? []).filter(Boolean),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.image_url || !form.price) {
      toast.error("Missing fields", { description: "Name, price and main image are required." });
      return;
    }
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      tagline: form.tagline.trim(),
      sold_out: form.sold_out,
      image_url: form.image_url,
      images: form.images,
    };
    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    toast.success(form.id ? "Product updated" : "Product added");
    resetForm();
    fetchRows();
  }

  async function toggleSoldOut(r: ProductRow) {
    const { error } = await supabase
      .from("products")
      .update({ sold_out: !r.sold_out })
      .eq("id", r.id);
    if (error) {
      toast.error("Update failed", { description: error.message });
      return;
    }
    setRows((p) => p.map((x) => (x.id === r.id ? { ...x, sold_out: !x.sold_out } : x)));
  }

  async function remove(r: ProductRow) {
    if (!confirm(`Delete "${r.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", r.id);
    if (error) {
      toast.error("Delete failed", { description: error.message });
      return;
    }
    setRows((p) => p.filter((x) => x.id !== r.id));
    toast.success("Deleted");
  }

  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <span className="eyebrow">Restricted</span>
          <h1 className="mt-4 font-serif text-3xl">Admin Access Only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {user ? "Your account doesn't have admin permissions." : "Please sign in with the admin account."}
          </p>
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
            <h1 className="mt-4 font-serif text-4xl md:text-5xl">Products</h1>
          </div>
          <Link to="/admin" className="border-b border-ink pb-1 text-[10px] uppercase tracking-[0.2em]">
            Orders →
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="mt-10 grid gap-5 border border-border bg-card p-6 md:grid-cols-2">
          <h2 className="font-serif text-xl md:col-span-2">
            {form.id ? "Edit product" : "Add new product"}
          </h2>

          <label className="flex flex-col">
            <span className="eyebrow mb-2">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
              required
              maxLength={120}
            />
          </label>

          <label className="flex flex-col">
            <span className="eyebrow mb-2">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              className="border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="eyebrow mb-2">Price (DH)</span>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="border border-border bg-background px-3 py-2 font-mono text-sm tabular-nums focus:border-ink focus:outline-none"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="eyebrow mb-2">Tagline (optional)</span>
            <input
              value={form.tagline}
              onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              className="border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none"
              maxLength={60}
              placeholder="e.g. New Arrival"
            />
          </label>

          <div className="md:col-span-2">
            <span className="eyebrow mb-2 block">Main image (cover)</span>
            <div className="flex flex-wrap items-center gap-4">
              {form.image_url && (
                <img src={form.image_url} alt="cover preview" className="h-24 w-20 object-cover" />
              )}
              <label className="cursor-pointer border border-border bg-background px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted">
                {uploading ? "Uploading…" : form.image_url ? "Replace cover" : "Upload cover"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setForm((f) => ({ ...f, image_url: url }));
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <span className="eyebrow mb-2 block">Gallery images (extra)</span>
            <div className="flex flex-wrap items-center gap-3">
              {form.images.map((url, i) => (
                <div key={url + i} className="relative">
                  <img src={url} alt={`extra ${i + 1}`} className="h-24 w-20 object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
                    }
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] text-marble shadow hover:opacity-80"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="cursor-pointer border border-dashed border-border bg-background px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted">
                {uploading ? "Uploading…" : "+ Add image"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length === 0) return;
                    const uploaded: string[] = [];
                    for (const f of files) {
                      const url = await uploadImage(f);
                      if (url) uploaded.push(url);
                    }
                    if (uploaded.length > 0) {
                      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Add multiple photos — customers can browse them in the image viewer.
            </p>
          </div>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.sold_out}
              onChange={(e) => setForm((f) => ({ ...f, sold_out: e.target.checked }))}
              className="h-4 w-4"
            />
            <span className="text-sm">Mark as sold out</span>
          </label>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={busy || uploading}
              className="bg-ink px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-marble hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Saving…" : form.id ? "Update product" : "Add product"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-border px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-muted"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <h2 className="mt-16 font-serif text-2xl">All products</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {loading ? "Loading…" : `${rows.length} product${rows.length === 1 ? "" : "s"}`}
        </p>

        <div className="mt-6 grid gap-4">
          {rows.map((r) => (
            <article key={r.id} className="flex flex-wrap items-center gap-4 border border-border bg-card p-4">
              <img src={r.image_url} alt={r.name} className="h-20 w-16 flex-shrink-0 object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-serif text-base">
                  {r.name}
                  {r.sold_out && (
                    <span className="ml-2 bg-muted px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Sold out
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {r.category} · <span className="font-mono tabular-nums">{formatPrice(Number(r.price))}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => editRow(r)}
                  className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleSoldOut(r)}
                  className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-muted"
                >
                  {r.sold_out ? "Mark available" : "Mark sold out"}
                </button>
                <button
                  onClick={() => remove(r)}
                  className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!loading && rows.length === 0 && (
            <p className="border-t border-border pt-12 text-center text-muted-foreground">
              No products yet. Add your first one above.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
