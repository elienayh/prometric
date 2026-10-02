/**
 * Integração com Stripe para o ProMetric
 * 
 * VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS NO CLOUDFLARE / SERVIDOR:
 * 1. STRIPE_SECRET_KEY: Chave secreta da API Stripe (ex: sk_live_... ou sk_test_...)
 * 2. STRIPE_WEBHOOK_SECRET: Chave secreta do endpoint de Webhook (ex: whsec_...)
 */

import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { checkTenantAdminPermission } from "./team-invitations.server";

let _stripeClient: Stripe | undefined;

/**
 * Retorna uma instância do cliente Stripe autenticado.
 * Lança erro explícito se a chave secreta não estiver configurada no servidor.
 */
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY ausente no servidor");
  }

  if (!_stripeClient) {
    _stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  }

  return _stripeClient;
}

export type CheckoutSessionOptions = {
  tenantId: string;
  planSlug: string;
  interval: "monthly" | "yearly";
  origin?: string;
  userId: string;
};

/**
 * Cria uma sessão do Stripe Checkout no modo subscription para o tenant.
 */
export async function createCheckoutSessionServer({
  tenantId,
  planSlug,
  interval,
  origin,
  userId,
}: CheckoutSessionOptions): Promise<{ url: string }> {
  // 1. Validar se o usuário que fez a requisição é admin do tenant
  const canAdmin = await checkTenantAdminPermission(userId, tenantId);
  if (!canAdmin) {
    throw new Error("Você não tem permissão de administrador nesta escola/organização.");
  }

  const stripe = getStripeClient();

  // 2. Buscar informações do tenant
  const { data: tenant, error: tenantErr } = await supabaseAdmin
    .from("tenants")
    .select("id, name, display_name, email, plan_id")
    .eq("id", tenantId)
    .single();

  if (tenantErr || !tenant) {
    throw new Error("Organização/escola não encontrada.");
  }

  // 3. Buscar plano desejado no banco
  // Aceita 'pro' ou 'professor' como slug
  const targetSlug = planSlug === "pro" ? "professor" : planSlug;
  const { data: plan, error: planErr } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("slug", targetSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (planErr || !plan) {
    throw new Error(`Plano '${planSlug}' não encontrado ou inativo.`);
  }

  if (plan.slug === "free" || Number(plan.price_monthly) === 0) {
    throw new Error("O plano gratuito não requer checkout ou pagamento.");
  }

  // Obter o Price ID correspondente ao ciclo escolhido
  const priceId =
    interval === "yearly"
      ? (plan as any).stripe_price_id_yearly
      : (plan as any).stripe_price_id_monthly;

  if (!priceId) {
    throw new Error(
      `O identificador de preço da Stripe (${
        interval === "yearly" ? "stripe_price_id_yearly" : "stripe_price_id_monthly"
      }) não foi cadastrado no banco para o plano ${plan.name}. Cadastre o Price ID no banco antes de prosseguir.`
    );
  }

  // 4. Buscar ou criar stripe_customer_id em subscriptions
  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("id, stripe_customer_id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: (tenant.display_name as string) || tenant.name,
      email: (tenant.email as string) || undefined,
      metadata: {
        tenant_id: tenantId,
      },
    });

    customerId = customer.id;

    if (existingSub?.id) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("id", existingSub.id);
    } else {
      await supabaseAdmin.from("subscriptions").insert({
        tenant_id: tenantId,
        plan_id: plan.id,
        stripe_customer_id: customerId,
        status: "trial",
        billing_cycle: interval,
      });
    }
  }

  // 5. Criar Checkout Session na Stripe
  const baseUrl = origin ? origin.replace(/\/$/, "") : "https://prometric.app";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/settings?checkout=canceled`,
    metadata: {
      tenant_id: tenantId,
      plan_id: plan.id,
      plan_slug: plan.slug,
      billing_interval: interval,
    },
    subscription_data: {
      metadata: {
        tenant_id: tenantId,
        plan_id: plan.id,
        plan_slug: plan.slug,
        billing_interval: interval,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Não foi possível gerar a URL de checkout da Stripe.");
  }

  return { url: session.url };
}

/**
 * Trata o webhook HTTP da Stripe com validação da assinatura
 */
export async function handleStripeWebhook(request: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET ausente no servidor");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Cabeçalho stripe-signature ausente" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Erro ao validar assinatura:", err.message);
    return new Response(
      JSON.stringify({ error: `Assinatura de Webhook inválida: ${err.message}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log(`[Stripe Webhook] Evento recebido: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenant_id;
        const planId = session.metadata?.plan_id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (tenantId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await syncTenantSubscription(tenantId, sub, planId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenant_id || (await findTenantIdByCustomer(sub.customer as string));
        if (tenantId) {
          await syncTenantSubscription(tenantId, sub, sub.metadata?.plan_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenant_id || (await findTenantIdByCustomer(sub.customer as string));
        if (tenantId) {
          await handleSubscriptionCanceled(tenantId, sub);
        }
        break;
      }

      default:
        // Outros eventos são ignorados sem erro
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(`[Stripe Webhook] Erro ao processar evento ${event.type}:`, err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Busca o tenant_id a partir do customer ID da Stripe salvo em subscriptions
 */
async function findTenantIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("tenant_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.tenant_id ?? null;
}

/**
 * Sincroniza o estado da assinatura do Stripe com a tabela subscriptions e tenants
 */
async function syncTenantSubscription(
  tenantId: string,
  sub: Stripe.Subscription,
  overridePlanId?: string
) {
  const isGoodStanding = sub.status === "active" || sub.status === "trialing";
  const interval = sub.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
  const priceId = sub.items.data[0]?.price?.id;

  // Determinar plan_id se não veio no metadata
  let targetPlanId = overridePlanId;
  if (!targetPlanId) {
    // Buscar plano pelo price_id
    const { data: matchedPlan } = await supabaseAdmin
      .from("plans")
      .select("id")
      .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
      .maybeSingle();

    if (matchedPlan) {
      targetPlanId = matchedPlan.id;
    }
  }

  // 1. Atualizar ou criar registro em subscriptions
  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const subPayload = {
    tenant_id: tenantId,
    ...(targetPlanId ? { plan_id: targetPlanId } : {}),
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    stripe_status: sub.status,
    cancel_at_period_end: sub.cancel_at_period_end,
    billing_cycle: interval,
    status: isGoodStanding ? "active" : ("suspended" as any),
    current_period_start: (sub as any).current_period_start
      ? new Date((sub as any).current_period_start * 1000).toISOString()
      : null,
    current_period_end: (sub as any).current_period_end
      ? new Date((sub as any).current_period_end * 1000).toISOString()
      : null,
  };

  if (existingSub?.id) {
    await supabaseAdmin.from("subscriptions").update(subPayload).eq("id", existingSub.id);
  } else {
    await supabaseAdmin.from("subscriptions").insert(subPayload);
  }

  // 2. Atualizar tenants (plan_id e status)
  const tenantUpdates: Record<string, any> = {};
  if (targetPlanId) {
    tenantUpdates.plan_id = targetPlanId;
  }

  if (isGoodStanding) {
    tenantUpdates.status = "active";
  } else if (sub.status === "past_due" || sub.status === "unpaid") {
    tenantUpdates.status = "suspended";
  } else if (sub.status === "canceled") {
    tenantUpdates.status = "canceled";
  }

  if (Object.keys(tenantUpdates).length > 0) {
    await supabaseAdmin.from("tenants").update(tenantUpdates as any).eq("id", tenantId);
  }
}

/**
 * Trata o cancelamento de assinatura: marca como canceled e rebaixa para plano Gratuito
 */
async function handleSubscriptionCanceled(tenantId: string, sub: Stripe.Subscription) {
  // Atualiza subscriptions
  await supabaseAdmin
    .from("subscriptions")
    .update({
      stripe_status: "canceled",
      status: "canceled" as any,
      cancel_at_period_end: false,
    })
    .eq("tenant_id", tenantId);

  // Procura o plano Gratuito
  const { data: freePlan } = await supabaseAdmin
    .from("plans")
    .select("id")
    .eq("slug", "free")
    .maybeSingle();

  // Reverte para o plano gratuito mantendo o tenant ativo
  if (freePlan?.id) {
    await supabaseAdmin
      .from("tenants")
      .update({
        plan_id: freePlan.id,
        status: "active",
      })
      .eq("id", tenantId);
  } else {
    await supabaseAdmin
      .from("tenants")
      .update({ status: "canceled" })
      .eq("id", tenantId);
  }
}
