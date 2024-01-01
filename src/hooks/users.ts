import { UserService, UserUpdate } from "@/api";
import { authRequest } from "@/auth";
import { useMsal } from "@azure/msal-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUsers(role?: string) {
  if (role === undefined) {
    return useQuery({ queryKey: ["users"], queryFn: () => UserService.readUsers() });
  }
  return useQuery({ queryKey: ["users", role], queryFn: () => UserService.readUsers(role) });
}

export function useUser(userId: string) {
  return useQuery({ queryKey: ["users", userId], queryFn: () => UserService.readUser(userId) });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["users", "current"],
    queryFn: () =>
      UserService.readCurrentUser().catch((error) => {
        if (error.status === 401 || error.status === 404) return Promise.resolve(null);
        return Promise.reject(error);
      }),
  });
}

export function useCurrentUserRole() {
  const user = useCurrentUser();

  return {
    isAdmin: user.data?.role === "admin" ?? false,
    isStaff: user.data?.role === "staff" ?? false,
    isStudent: user.data?.role === "student" ?? false,
  };
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: UserUpdate) => UserService.updateUser(userId, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => UserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useLoginUser() {
  const queryClient = useQueryClient();
  const { instance: msalInstance } = useMsal();

  return useMutation({
    mutationFn: async () => {
      const { account } = await msalInstance.loginPopup(authRequest);
      msalInstance.setActiveAccount(account);
      UserService.createUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "current"] });
    },
  });
}

export function useLogoutUser() {
  const queryClient = useQueryClient();
  const { instance: msalInstance } = useMsal();

  return useMutation({
    mutationFn: () => msalInstance.logoutPopup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "current"] });
    },
  });
}
