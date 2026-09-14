
CREATE TABLE public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.member_role NOT NULL DEFAULT 'evaluator',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tenant_invitations_tenant_idx ON public.tenant_invitations(tenant_id, status);
CREATE INDEX tenant_invitations_token_idx ON public.tenant_invitations(token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_invitations TO authenticated;
GRANT ALL ON public.tenant_invitations TO service_role;

ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage invitations"
  ON public.tenant_invitations FOR ALL TO authenticated
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));

-- Convidado lê o próprio convite pelo token (controlado via server fn).
CREATE POLICY "auth can read by token via fn"
  ON public.tenant_invitations FOR SELECT TO authenticated
  USING (true);

CREATE TRIGGER tenant_invitations_set_updated_at
  BEFORE UPDATE ON public.tenant_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.accept_invitation(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _inv tenant_invitations%ROWTYPE;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _inv FROM tenant_invitations WHERE token = _token;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite inválido'; END IF;
  IF _inv.status <> 'pending' THEN RAISE EXCEPTION 'Convite já utilizado ou revogado'; END IF;
  IF _inv.expires_at < now() THEN
    UPDATE tenant_invitations SET status='revoked' WHERE id=_inv.id;
    RAISE EXCEPTION 'Convite expirado';
  END IF;

  INSERT INTO tenant_members (tenant_id, user_id, role)
  VALUES (_inv.tenant_id, _uid, _inv.role)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  UPDATE tenant_invitations
     SET status='accepted', accepted_at=now(), accepted_by=_uid
   WHERE id=_inv.id;

  UPDATE profiles SET current_tenant_id = _inv.tenant_id WHERE id = _uid;

  RETURN _inv.tenant_id;
END;
$$;
