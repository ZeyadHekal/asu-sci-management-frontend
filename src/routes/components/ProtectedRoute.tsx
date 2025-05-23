import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../global/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedPrivileges?: string[];
}

const ProtectedRoute = ({
  children,
  allowedPrivileges,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isTokenExpired, hasPrivilege } = useAuth();

  if (!isAuthenticated || isTokenExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedPrivileges &&
    !allowedPrivileges.some((priv) => hasPrivilege(priv))
  ) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
