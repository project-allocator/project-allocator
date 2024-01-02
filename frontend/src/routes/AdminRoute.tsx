import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute({ fallback }: { fallback: string }) {
  const { isLoading, isAdmin } = useAuth();
  if (isLoading) return null;

  return isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
