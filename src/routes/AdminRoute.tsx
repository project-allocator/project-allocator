import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute({ fallback }: { fallback: string }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
