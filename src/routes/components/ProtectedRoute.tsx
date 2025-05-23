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

  // Allow admin users (with MANAGE_USER_TYPES or MANAGE_SYSTEM privilege) to access any page
  if (hasPrivilege("MANAGE_USER_TYPES") || hasPrivilege("MANAGE_SYSTEM")) {
    return <>{children}</>;
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
