import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface GuestRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

export default function GuestRoute({ children, fallback }: GuestRouteProps) {
  const { user } = useUser();
  if (user) {
    if (fallback) return <Navigate to={fallback} />;
    return null;
  }
  return children;
}