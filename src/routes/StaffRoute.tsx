import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StaffRoute({ fallback }: { fallback: string }) {
  const { isLoading, isError, isAdmin, isStaff } = useAuth();
  if (isLoading || isError) return null;

  return isStaff || isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
