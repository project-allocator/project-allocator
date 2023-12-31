import { ConfigService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useConfig(key: string) {
  return useQuery(["config", key], () => ConfigService.readConfig(key));
}

export function useUpdateConfig(key: string) {
  const queryClient = useQueryClient();

  return useMutation((value: any) => ConfigService.updateConfig(key, { value }), {
    onMutate: async (value: any) => {
      await queryClient.cancelQueries(["config", key]);
      const oldConfig = queryClient.getQueryData(["config", key]);
      queryClient.setQueryData(["config", key], value);
      return { oldConfig };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["config", key], context?.oldConfig);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["config", key]);
    },
  });
}
