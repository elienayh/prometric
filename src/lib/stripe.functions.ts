import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CheckoutSessionInput = z.object({
  tenantId: z.string().uuid("ID de tenant inválido"),
  planSlug: z.string().min(1, "Slug do plano obrigatório"),
  interval: z.enum(["monthly", "yearly"]),
  origin: z.string().url().optional(),
});

export type CheckoutSessionResult = {
  url: string;
};

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CheckoutSessionInput.parse(d))
  .handler(async ({ data, context }): Promise<CheckoutSessionResult> => {
    const { userId } = context;
    const { tenantId, planSlug, interval, origin } = data;

    const { createCheckoutSessionServer } = await import("./stripe.server");

    return await createCheckoutSessionServer({
      tenantId,
      planSlug,
      interval,
      origin,
      userId,
    });
  });
