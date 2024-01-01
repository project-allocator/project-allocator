import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute({ fallback }: { fallback: string }) {
  const { isGuest } = useAuth();
  return isGuest ? <Outlet /> : <Navigate to={fallback} />;
}
