import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StaffRoute({ fallback }: { fallback: string }) {
  const { isAdmin, isStaff } = useAuth();
  return isStaff || isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
