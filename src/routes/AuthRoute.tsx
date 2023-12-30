import { useCurrentUser } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthRoute({ fallback }: { fallback: string }) {
  const user = useCurrentUser();
  if (user.isLoading) return null;

  return user.data ? <Outlet /> : <Navigate to={fallback} />;
}
