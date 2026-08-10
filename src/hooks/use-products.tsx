import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dbToProduct, PRODUCTS, type Product } from "@/lib/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (!active) return;
      if (!error && data && data.length > 0) {
        setProducts(data.map((r) => dbToProduct(r as never)));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}
