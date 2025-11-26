import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "sonner";

interface AdminRouteProps {
  children: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const auth = useSelector((state: RootState) => state.auth);

  if (!auth?.isAuthenticated) {
    toast.error("Please sign in to access this page");
    return <Navigate to="/signin" replace />;
  }

  if (auth.user?.role !== "ADMIN") {
    toast.error("Access denied: admin only");
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default AdminRoute;
