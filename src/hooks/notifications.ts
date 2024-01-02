import { NotificationCreate, NotificationRead, NotificationService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
  // Do not use suspense as there is no need to wait for notifications.
  return useQuery({
    queryKey: ["users", "notifications"],
    queryFn: () => NotificationService.readNotifications(),
    // Using polling every minute to fetch new notifications.
    refetchInterval: 60 * 1000,
  });
}

export function useSendNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { notification_data: NotificationCreate; roles: string[] }) =>
      NotificationService.sendNotifications(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "notifications"] });
    },
  });
}

export function useMarkReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => NotificationService.markReadNotifications(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["users", "notifications"] });
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
      queryClient.invalidateQueries({ queryKey: ["users", "notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users", "notifications"] });
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
      queryClient.invalidateQueries({ queryKey: ["users", "notifications"] });
    },
  });
}
