import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface StudentRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

export default function StudentRoute({
  children,
  fallback: fallback,
}: StudentRouteProps) {
  const { user } = useUser();
  if (user?.role !== "student") {
    if (fallback) return <Navigate to={fallback} />;
    return null;
  }
  return children;
}
