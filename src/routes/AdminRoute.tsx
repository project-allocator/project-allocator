import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

export default function AdminRoute({ children, fallback }: AdminRouteProps) {
  const { user } = useUser();
  if (user?.role !== "admin") {
    if (fallback) return <Navigate to={fallback} />;
    return null;
  }
  return children;
}
