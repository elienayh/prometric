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
export function useHomePageConfig(initialServerConfig?: HomePageConfig) {
  const qc = useQueryClient();

  const query = useQuery<HomePageConfig>({
    queryKey: HOMEPAGE_CONFIG_QUERY_KEY,
    initialData: () => initialServerConfig || getLocalHomePageConfig(),
    // Se veio do servidor com dados reais, considera recente; senão força revalidação imediata
    initialDataUpdatedAt: initialServerConfig ? Date.now() : 0,
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
    staleTime: 1000 * 30, // 30 segundos
    refetchOnMount: true,
  });

  const saveMutation = useMutation({
    mutationFn: async (newConfig: HomePageConfig) => {
      // 1. Salva imediatamente no localStorage para resposta instantânea na aba atual
      saveLocalHomePageConfig(newConfig);

      // 2. Persiste permanentemente no servidor/Supabase para todos os navegadores e dispositivos
      const res = await savePublishedHomePageConfig({ data: newConfig });
      const finalConfig = res?.config || newConfig;
      saveLocalHomePageConfig(finalConfig);
      return finalConfig;
    },
    onSuccess: (updated) => {
      qc.setQueryData(HOMEPAGE_CONFIG_QUERY_KEY, updated);
      toast.success("Página inicial salva e publicada com sucesso para todos os dispositivos!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar página inicial no banco de dados.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      resetLocalHomePageConfig();
      await resetPublishedHomePageConfig();
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
