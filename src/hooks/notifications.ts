import { NotificationCreate, NotificationService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useNotifications() {
  return useQuery(["notifications"], () => NotificationService.readNotifications(), {
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useSendNotifications() {
  const queryClient = useQueryClient();

  return useMutation(
    (variables: { notification_data: NotificationCreate; roles: string[] }) =>
      NotificationService.sendNotifications(variables),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["notifications"]);
      },
    }
  );
}

export function useMarkNotifications() {
  const queryClient = useQueryClient();

  return useMutation((ids: string[]) => NotificationService.markNotifications(ids), {
    onMutate: async (ids) => {
      await queryClient.cancelQueries(["notifications"]);
      const oldNotifications = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(
        ["notifications"],
        (oldNotifications as any).map((notification: any) => {
          if (!ids.includes(notification.id)) return notification;
          return { ...notification, read: true };
        })
      );
      return { oldNotifications };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["notifications"], context.oldNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => NotificationService.deleteNotification(id), {
    onMutate: async (id) => {
      await queryClient.cancelQueries(["notifications"]);
      const oldNotifications = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(
        ["notifications"],
        (oldNotifications as any).filter((notification: any) => notification.id !== id)
      );
      return { oldNotifications };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["notifications"], context.oldNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
}
