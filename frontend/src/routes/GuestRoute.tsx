import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute({ fallback }: { fallback: string }) {
  const { isLoading, isGuest } = useAuth();
  if (isLoading) return null;

  return isGuest ? <Outlet /> : <Navigate to={fallback} />;
}
