import { useCurrentUser, useCurrentUserRole } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StaffRoute({ fallback }: { fallback: string }) {
  const user = useCurrentUser();
  if (user.isLoading) return null;

  const { isAdmin, isStaff } = useCurrentUserRole();
  return isStaff || isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
