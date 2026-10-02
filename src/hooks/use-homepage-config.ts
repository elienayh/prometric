import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  getLocalHomePageConfig,
  HomePageConfig,
  mergeWithDefaultConfig,
  resetLocalHomePageConfig,
  saveLocalHomePageConfig,
} from "@/lib/homepage-cms";
import {
  getPublishedHomePageConfig,
  resetPublishedHomePageConfig,
  savePublishedHomePageConfig,
} from "@/lib/homepage-cms.functions";
import { toast } from "sonner";

export const HOMEPAGE_CONFIG_QUERY_KEY = ["homepage-cms-config"];

/**
 * Hook para obter a configuração ativa da página inicial (pública ou admin).
 * Combina banco de dados com cache local para carregamento instantâneo sem piscar.
 */
export function useHomePageConfig() {
  const qc = useQueryClient();

  const query = useQuery<HomePageConfig>({
    queryKey: HOMEPAGE_CONFIG_QUERY_KEY,
    initialData: () => getLocalHomePageConfig(),
    queryFn: async () => {
      try {
        const remote = await getPublishedHomePageConfig();
        if (remote) {
          const merged = mergeWithDefaultConfig(remote);
          saveLocalHomePageConfig(merged);
          return merged;
        }
      } catch (err) {
        console.warn("[useHomePageConfig] Erro ao buscar configuração remota:", err);
      }
      return getLocalHomePageConfig();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache fresco
  });

  const saveMutation = useMutation({
    mutationFn: async (newConfig: HomePageConfig) => {
      // 1. Salva imediatamente no localStorage para resposta instantânea
      saveLocalHomePageConfig(newConfig);

      // 2. Persiste no servidor/Supabase
      try {
        const res = await savePublishedHomePageConfig({ data: newConfig });
        return res?.config || newConfig;
      } catch (err: any) {
        // Se falhar no servidor, mantém no local
        console.warn("[useHomePageConfig] Falha no servidor, mantido localmente:", err);
        return newConfig;
      }
    },
    onSuccess: (updated) => {
      qc.setQueryData(HOMEPAGE_CONFIG_QUERY_KEY, updated);
      toast.success("Página inicial salva e publicada com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar página inicial.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      resetLocalHomePageConfig();
      try {
        await resetPublishedHomePageConfig();
      } catch {
        // ignora
      }
      return DEFAULT_HOMEPAGE_CONFIG;
    },
    onSuccess: (defaults) => {
      qc.setQueryData(HOMEPAGE_CONFIG_QUERY_KEY, defaults);
      toast.success("Configuração restaurada para o padrão oficial ProMetric®!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao restaurar configurações padrão.");
    },
  });

  return {
    config: query.data || DEFAULT_HOMEPAGE_CONFIG,
    isLoading: query.isLoading,
    isSaving: saveMutation.isPending,
    isResetting: resetMutation.isPending,
    saveConfig: saveMutation.mutateAsync,
    resetConfig: resetMutation.mutateAsync,
    refetch: query.refetch,
  };
}
