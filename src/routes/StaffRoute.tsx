import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface StaffRouteProps {
    children: React.ReactNode;
    fallback?: string;
}

export default function StaffRoute({ children, fallback }: StaffRouteProps) {
    const { user } = useUser();
    if (user?.role !== "staff" && user?.role !== "admin") {
        if (fallback) return <Navigate to={fallback} />;
        return null;
    }
    return children;
}