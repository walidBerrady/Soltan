ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Allow updates and deletes from the admin (public, no auth in this demo)
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
CREATE POLICY "Anyone can update orders"
ON public.orders FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete orders" ON public.orders;
CREATE POLICY "Anyone can delete orders"
ON public.orders FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);