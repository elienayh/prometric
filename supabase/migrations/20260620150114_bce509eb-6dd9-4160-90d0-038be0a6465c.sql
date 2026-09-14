
DROP POLICY IF EXISTS "Members read branding" ON storage.objects;
CREATE POLICY "Members read branding" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'branding'
    AND public.is_tenant_member((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "Writers upload branding" ON storage.objects;
CREATE POLICY "Writers upload branding" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'branding'
    AND public.can_write_tenant((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "Writers update branding" ON storage.objects;
CREATE POLICY "Writers update branding" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'branding'
    AND public.can_write_tenant((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "Writers delete branding" ON storage.objects;
CREATE POLICY "Writers delete branding" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'branding'
    AND public.can_write_tenant((storage.foldername(name))[1]::uuid)
  );
