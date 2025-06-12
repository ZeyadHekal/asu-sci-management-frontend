import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { useSidebarLinks } from "../../features/layouts/SidebarLinks";

// Define route permissions in a similar way to the sidebar links
interface RouteDefinition {
  path: string;
  privilege?: string;
  priority: number; // Higher priority routes will be preferred
  conditionalAccess?: (privileges: string[]) => boolean;
}

// Define all possible landing routes with their permission requirements - in priority order
const landingRoutes: RouteDefinition[] = [
  {
    path: "/staff",
    privilege: "MANAGE_SYSTEM",
    priority: 100
  },
  {
    path: "/students",
    privilege: "MANAGE_STUDENTS",
    priority: 95
  },
  {
    path: "/courses",
    privilege: "MANAGE_COURSES",
    priority: 90
  },
  {
    path: "/lab-assistant",
    privilege: "LAB_ASSISTANT",
    priority: 85
  },
  {
    path: "/labs",
    privilege: "LAB_MAINTENANCE",
    priority: 80
  },
  {
    path: "/reports",
    privilege: "REPORT_DEVICE",
    priority: 75
  },
  {
    path: "/courses",
    conditionalAccess: (privileges) => 
      privileges.includes("TEACH_COURSE") || 
      privileges.includes("ASSIST_IN_COURSE") || 
      privileges.includes("STUDY_COURSE"),
    priority: 70
  },
  // Fallback has been removed - if no routes are accessible, show NoAccessPage
];

const LandingRedirect = () => {
  const navigate = useNavigate();
  const privileges = useAuthStore((s) => s.user?.privileges || []);
  const hasPrivilege = useAuthStore((s) => s.hasPrivilege);
  const sidebarLinks = useSidebarLinks();
  
  useEffect(() => {
    // If there are no sidebar links available, redirect to NoAccessPage
    if (sidebarLinks.length === 0) {
      navigate("/no-access", { replace: true });
      return;
    }
    
    // Filter routes based on user permissions
    const accessibleRoutes = landingRoutes.filter(route => {
      // Check if the route has a required privilege
      if (route.privilege) {
        return hasPrivilege(route.privilege);
      }
      
      // Check if the route has conditional access
      if (route.conditionalAccess) {
        return route.conditionalAccess(privileges);
      }
      
      // If no permission check is specified
      return true;
    });

    // Sort by priority (higher priority first)
    accessibleRoutes.sort((a, b) => b.priority - a.priority);

    // Navigate to the highest priority accessible route
    if (accessibleRoutes.length > 0) {
      navigate(accessibleRoutes[0].path, { replace: true });
    } else {
      // If no routes are accessible, show the NoAccessPage
      navigate("/no-access", { replace: true });
    }
  }, [privileges, navigate, hasPrivilege, sidebarLinks]);

  return null;
};

export default LandingRedirect;
