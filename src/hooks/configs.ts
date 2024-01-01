import { ConfigService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useConfig(key: string) {
  return useQuery({ queryKey: ["config", key], queryFn: () => ConfigService.readConfig(key) });
}

export function useUpdateConfig(key: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: any) => ConfigService.updateConfig(key, { value }),
    onMutate: async (value: any) => {
      await queryClient.cancelQueries({ queryKey: ["config", key] });
      const oldConfig = queryClient.getQueryData(["config", key]);
      queryClient.setQueryData(["config", key], value);
      return { oldConfig };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["config", key], context?.oldConfig);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["config", key] });
    },
  });
}
