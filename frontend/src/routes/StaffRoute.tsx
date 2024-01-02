import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StaffRoute({ fallback }: { fallback: string }) {
  const { isLoading, isAdmin, isStaff } = useAuth();
  if (isLoading) return null;

  return isStaff || isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
