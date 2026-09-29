-- =====================================================================
-- Migration: 20260929100000_constrain_tenant_ai_credentials_provider.sql
-- Descrição:
-- 1. Desativa credenciais de IA com provedores fora do catálogo homologado (ex.: 'lovable'), preservando os dados históricos.
-- 2. Adiciona CHECK constraint em tenant_ai_credentials.provider limitando aos 4 provedores válidos:
--    'google', 'openai', 'anthropic', 'xai'.
-- =====================================================================

-- b) Para linhas existentes com provider fora desses 4 valores, define is_active = false antes de aplicar a constraint
UPDATE public.tenant_ai_credentials
SET is_active = false
WHERE provider::text NOT IN ('google', 'openai', 'anthropic', 'xai');

-- a) Adiciona uma CHECK constraint em tenant_ai_credentials.provider limitando aos 4 valores válidos
ALTER TABLE public.tenant_ai_credentials
  DROP CONSTRAINT IF EXISTS tenant_ai_credentials_provider_check;

ALTER TABLE public.tenant_ai_credentials
  ADD CONSTRAINT tenant_ai_credentials_provider_check
  CHECK (provider::text IN ('google', 'openai', 'anthropic', 'xai')) NOT VALID;
