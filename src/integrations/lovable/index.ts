import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft" | "lovable",
      opts?: SignInOptions
    ) => {
      const redirectUrl =
        opts?.redirect_uri ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback");

      const supabaseProvider = provider === "google" ? "google" : provider;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider as "google" | "apple",
        options: {
          redirectTo: redirectUrl,
          queryParams: opts?.extraParams,
        },
      });

      if (error) {
        return { error };
      }

      return { redirected: true, data };
    },
  },
};

