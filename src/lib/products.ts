import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import p9 from "@/assets/p9.jpg";
import p10 from "@/assets/p10.jpg";
import p11 from "@/assets/p11.jpg";
import p12 from "@/assets/p12.jpg";

export type Category = "Dresses" | "Bags" | "Shoes" | "Jewelry";

export type Product = {
  id: string;
  name: string;
  price: number; // in MAD (Moroccan Dirham)
  image: string;
  images?: string[];
  category: Category;
  tagline: string;
  soldOut?: boolean;
};

export const CURRENCY = "DH";

export const formatPrice = (n: number) =>
  `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n)} ${CURRENCY}`;

// Fallback / seed catalog used when the database has no products yet.
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Pima Cotton Column Dress", price: 2400, image: p1, category: "Dresses", tagline: "New Arrival" },
  { id: "p2", name: "Unstructured Stone Blazer", price: 4850, image: p2, category: "Dresses", tagline: "Organic Wool" },
  { id: "p3", name: "Hand-Polished Brass Cuff", price: 1950, image: p3, category: "Jewelry", tagline: "Signature" },
  { id: "p4", name: "Tapered Leather Mule", price: 3600, image: p4, category: "Shoes", tagline: "Limited Edition" },
  { id: "p5", name: "Structured Leather Tote", price: 4200, image: p5, category: "Bags", tagline: "Everyday" },
  { id: "p6", name: "Fine Gold Chain Necklace", price: 1800, image: p6, category: "Jewelry", tagline: "14k Gold" },
  { id: "p7", name: "Champagne Silk Slip Dress", price: 3200, image: p7, category: "Dresses", tagline: "Evening" },
  { id: "p8", name: "Oatmeal Cashmere Knit", price: 2750, image: p8, category: "Dresses", tagline: "Pure Cashmere" },
  { id: "p9", name: "Cognac Crossbody Pouch", price: 2200, image: p9, category: "Bags", tagline: "Hand-Stitched" },
  { id: "p10", name: "Nude Pointed Leather Flat", price: 2950, image: p10, category: "Shoes", tagline: "Soft Calfskin" },
  { id: "p11", name: "Pearl Drop Gold Earrings", price: 1450, image: p11, category: "Jewelry", tagline: "Freshwater Pearl" },
  { id: "p12", name: "Sand Linen Midi Skirt", price: 1650, image: p12, category: "Dresses", tagline: "Summer Edit" },
];

export const CATEGORIES: Category[] = ["Dresses", "Bags", "Shoes", "Jewelry"];

// Adapter: DB row -> UI Product
export type DbProductRow = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  image_url: string;
  images?: string[] | null;
  tagline: string | null;
  sold_out: boolean;
};

export function dbToProduct(row: DbProductRow): Product {
  const gallery = (row.images ?? []).filter(Boolean);
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    image: row.image_url,
    images: gallery.length > 0 ? gallery : [row.image_url],
    category: row.category as Category,
    tagline: row.tagline ?? "",
    soldOut: row.sold_out,
  };
}
