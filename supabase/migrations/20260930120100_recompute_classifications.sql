-- ATENÇÃO: Esta migração serve para recalcular o histórico das avaliações antigas
-- com a nova referência OMS 2007 (5–19 anos) e critérios SBP.
--
-- NÃO EXECUTAR AUTOMATICAMENTE.
-- Execute manualmente no SQL Editor do Supabase SOMENTE após realizar backup da tabela 'evaluations'.

-- Bloco de recálculo comentado por segurança:
/*
UPDATE public.evaluations e
SET classifications = public.compute_eval_classifications(
  s.sex::text,
  COALESCE(e.age_years, EXTRACT(year FROM age(e.evaluated_at, s.birth_date))::int),
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
  e.run_6min_m
)
FROM public.students s
WHERE s.id = e.student_id;
*/
