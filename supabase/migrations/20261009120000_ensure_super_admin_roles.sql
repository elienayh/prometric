-- Migração para garantir papéis de Super Admin para contas proprietárias
-- e permissão de leitura anônima para a configuração de CMS da página inicial

INSERT INTO public.admin_roles (user_id, role)
SELECT id, 'super_admin'::public.admin_role FROM auth.users
WHERE lower(email) IN (
  'elienayhemerson@gmail.com',
  'elienay9080@gmail.com',
  'elienay.domingues@educacao.mg.gov.br'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Garantir que a linha de configuração de CMS em system_metrics possa ser lida publicamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'system_metrics' AND policyname = 'Public read homepage cms config'
  ) THEN
    CREATE POLICY "Public read homepage cms config" ON public.system_metrics
      FOR SELECT TO anon, authenticated
      USING (metric_date = '1970-01-01');
  END IF;
END $$;
