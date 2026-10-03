-- ============================================================================
-- Migração Fase 6: Recálculo em Lote e Backfill Seguro de Avaliações
-- ============================================================================
-- Atualiza age_years, age_months (calendário civil exato), imc, rce e classifications
-- com a curva OMS 2007 (5-19 anos) e critérios SBP.
-- Idempotente e transacional.
-- ============================================================================

DO $$
BEGIN
  -- 1. Atualizar age_years e age_months via calendário civil exato para todas as avaliações
  UPDATE public.evaluations e
  SET
    age_years = EXTRACT(year FROM age(e.evaluated_at::date, s.birth_date))::int,
    age_months = (EXTRACT(year FROM age(e.evaluated_at::date, s.birth_date))::int * 12 + EXTRACT(month FROM age(e.evaluated_at::date, s.birth_date))::int),
    imc = CASE
      WHEN e.weight_kg > 0 AND e.height_cm > 0 THEN
        round((e.weight_kg / ((e.height_cm / 100) * (e.height_cm / 100)))::numeric, 2)
      ELSE e.imc
    END,
    rce = CASE
      WHEN e.waist_cm > 0 AND e.height_cm > 0 THEN
        round((e.waist_cm / e.height_cm)::numeric, 3)
      ELSE e.rce
    END
  FROM public.students s
  WHERE s.id = e.student_id
    AND s.birth_date IS NOT NULL;

  -- 2. Recalcular classifications com a nova função de 15 parâmetros (incluindo age_months)
  UPDATE public.evaluations e
  SET classifications = public.compute_eval_classifications(
    s.sex::text,
    e.age_years,
    e.weight_kg,
    e.height_cm,
    e.waist_cm,
    e.imc,
    e.rce,
    e.sit_and_reach_cm,
    e.abdominal_reps,
    e.horizontal_jump_cm,
    e.medicine_ball_m,
    e.square_test_s,
    e.sprint_20m_s,
    e.run_6min_m,
    e.age_months
  )
  FROM public.students s
  WHERE s.id = e.student_id;
END $$;
