import { useUserContext } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
    children: React.ReactNode;
    redirect?: boolean;
}

export default function AdminRoute({ children, redirect }: AdminRouteProps) {
    const { user } = useUserContext();
    if (user?.role !== "admin") {
        if (redirect) return <Navigate to="/" />;
        return null;
    }
    return children;
}