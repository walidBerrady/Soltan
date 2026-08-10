CREATE OR REPLACE FUNCTION public.assign_admin_role_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IN ('walidberrady87@gmail.com', 'berradywalid87@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

INSERT INTO public.user_roles (user_id, role)
VALUES ('83a412ed-2228-46b1-ab0b-9d6fac8a43d4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;