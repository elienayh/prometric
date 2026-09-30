-- Migration: Reestruturar planos ProMetric e preparar base Stripe
-- 1. Gratuito: até 30 alunos, 1 usuário, R$ 0
-- 2. Pro: alunos ilimitados, 10 usuários, R$ 189,90/mês ou R$ 1.799,90/ano
-- 3. Inativação do plano school
-- 4. Suporte a colunas de preço Stripe (stripe_price_id_monthly, stripe_price_id_yearly)

-- 1. Alterar public.plans: permitir max_students NULL (ilimitado) e adicionar colunas de preço/stripe
ALTER TABLE public.plans
  ALTER COLUMN max_students DROP NOT NULL;

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS amount_yearly_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_price_id_monthly text,
  ADD COLUMN IF NOT EXISTS stripe_price_id_yearly text;

-- 2. Atualizar plano Gratuito (slug 'free')
UPDATE public.plans SET
  name = 'Gratuito',
  max_students = 30,
  max_users = 1,
  price_monthly = 0,
  amount_yearly_cents = 0,
  features = '["Até 30 alunos","1 usuário","Relatórios básicos"]'::jsonb,
  is_active = true
WHERE slug = 'free';

-- 3. Atualizar plano Pro (slug 'professor' preservado para compatibilidade de chaves estrangeiras)
UPDATE public.plans SET
  name = 'Pro',
  max_students = NULL,
  max_users = 10,
  price_monthly = 189.90,
  amount_yearly_cents = 179990,
  features = '["Alunos ilimitados","10 usuários","Relatórios PDF","Parecer com IA","Cobrança mensal ou anual"]'::jsonb,
  is_active = true
WHERE slug = 'professor';

-- 4. Desativar plano 'school' (sem deletar, preservando tenants legados que o referenciam)
UPDATE public.plans SET
  is_active = false
WHERE slug = 'school';

-- Desativar 'network' caso exista
UPDATE public.plans SET
  is_active = false
WHERE slug = 'network';
