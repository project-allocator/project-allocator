import { ConfigRead, ConfigService } from "@/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

export function useConfig(key: string) {
  return useSuspenseQuery({ queryKey: ["config", key], queryFn: () => ConfigService.readConfig(key) });
}

export function useUpdateConfig(key: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: any) => ConfigService.updateConfig(key, { value }),
    onMutate: async (value: any) => {
      await queryClient.cancelQueries({ queryKey: ["config", key] });
      const oldConfig = queryClient.getQueryData(["config", key]) as ConfigRead;
      queryClient.setQueryData(["config", key], value);
      return { oldConfig };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["config", key], context?.oldConfig.value);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["config", key] });
    },
  });
}
