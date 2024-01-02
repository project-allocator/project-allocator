import { UserService, UserUpdate } from "@/api";
import { authRequest } from "@/auth";
import { useMsal } from "@azure/msal-react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

export function useAuth() {
  const user = useQuery({
    queryKey: ["users", "current"],
    queryFn: () =>
      UserService.readCurrentUser().catch((error) => {
        if (error.status === 401 || error.status === 404) return Promise.resolve(null);
        return Promise.reject(error);
      }),
    // Checking login status every 10 minutes.
    refetchInterval: 10 * 60 * 1000,
  });

  const isGuest = user.data === null;
  const isAuth = !isGuest;
  const isAdmin = isAuth && user.data?.role === "admin";
  const isStaff = isAuth && user.data?.role === "staff";
  const isStudent = isAuth && user.data?.role === "student";

  return {
    isLoading: user.isLoading,
    isError: user.isError,
    isGuest,
    isAuth,
    isAdmin,
    isStaff,
    isStudent,
  };
}

export function useUsers(role?: string) {
  if (role === undefined) {
    return useSuspenseQuery({ queryKey: ["users"], queryFn: () => UserService.readUsers() });
  }
  return useSuspenseQuery({ queryKey: ["users", role], queryFn: () => UserService.readUsers(role) });
}

export function useUser(userId: string) {
  return useSuspenseQuery({ queryKey: ["users", userId], queryFn: () => UserService.readUser(userId) });
}

export function useCurrentUser() {
  return useSuspenseQuery({
    queryKey: ["users", "current"],
    queryFn: () => UserService.readCurrentUser(),
  });
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

export function useSignInUser() {
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

export function useSignOutUser() {
  const queryClient = useQueryClient();
  const { instance: msalInstance } = useMsal();

  return useMutation({
    mutationFn: () => msalInstance.logoutPopup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "current"] });
    },
  });
}

export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return async (userId: string) => {
    await queryClient.prefetchQuery({ queryKey: ["users", userId], queryFn: () => UserService.readUser(userId) });
  };
}
