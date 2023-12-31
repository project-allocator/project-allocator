import { NotificationCreate, NotificationRead, NotificationService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useNotifications() {
  return useQuery(["users", "notifications"], () => NotificationService.readNotifications(), {
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
        queryClient.invalidateQueries(["users", "notifications"]);
      },
    }
  );
}

export function useMarkReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation((ids: string[]) => NotificationService.markReadNotifications(ids), {
    onMutate: async (ids) => {
      await queryClient.cancelQueries(["users", "notifications"]);
      const oldNotifications = queryClient.getQueryData(["users", "notifications"]) as NotificationRead[];
      queryClient.setQueryData(
        ["notifications"],
        oldNotifications.map((notification) => {
          if (!ids.includes(notification.id)) return notification;
          return { ...notification, read: true };
        })
      );
      return { oldNotifications };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["users", "notifications"], context?.oldNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["users", "notifications"]);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => NotificationService.deleteNotification(id), {
    onMutate: async (id) => {
      await queryClient.cancelQueries(["users", "notifications"]);
      const oldNotifications = queryClient.getQueryData(["users", "notifications"]) as NotificationRead[];
      queryClient.setQueryData(
        ["users", "notifications"],
        oldNotifications.filter((notification) => notification.id !== id)
      );
      return { oldNotifications };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["users", "notifications"], context?.oldNotifications);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["users", "notifications"]);
    },
  });
}
