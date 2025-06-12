import {
  PiHouse,
  PiBooks,
  PiExam,
  PiChartBar,
  PiFlask,
  PiDevices,
  PiUsers,
  PiUserCircle,
  PiUserCircleGear,
  PiWarning,
  PiBellRinging,
  PiPlay,
} from "react-icons/pi";
import { useAuthStore } from "../../store/authStore";
import { useState, useEffect } from "react";
import { useDeviceReportControllerGetMyUnresolvedReportsCount } from "../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetMyUnresolvedReportsCount";

// Placeholder for getting the number of new grades
const getNewGradesCount = () => {
  // This would be an API call in a real application
  // For now, return a mock value for demonstration
  return 2;
};

interface SubMenuItem {
  label: string;
  to: string;
}

interface MenuItem {
  icon: React.ReactElement;
  label: string;
  to: string;
  subMenu: SubMenuItem[];
  privilege?: string; // Required privilege to see this item
  alwaysVisible?: boolean; // Whether the item should always be visible
  conditionalVisibility?: (privileges: string[]) => boolean; // Function to determine visibility
  badge?: {
    count: number;
    variant: "danger" | "warning" | "success" | "primary";
  };
}

// All possible links in the application
const allLinks: MenuItem[] = [
  {
    icon: <PiBooks size={20} />,
    label: "Courses",
    to: "/courses",
    subMenu: [],
    conditionalVisibility: (privileges) => 
      privileges.includes("MANAGE_COURSES") ||
      privileges.includes("TEACH_COURSE") || 
      privileges.includes("ASSIST_IN_COURSE") || 
      privileges.includes("STUDY_COURSE"),
  },
  {
    icon: <PiExam size={20} />,
    label: "Admin Exams",
    to: "/admin/exams",
    subMenu: [],
    privilege: "MANAGE_USER_TYPES",
  },
  {
    icon: <PiChartBar size={20} />,
    label: "Grades Management",
    to: "/admin/grades",
    subMenu: [],
    privilege: "MANAGE_USER_TYPES",
  },
  {
    icon: <PiFlask size={20} />,
    label: "Labs",
    to: "/labs",
    subMenu: [],
    privilege: "MANAGE_LABS",
  },
  {
    icon: <PiDevices size={20} />,
    label: "Devices",
    to: "/devices",
    subMenu: [],
    privilege: "MANAGE_LABS",
  },
  {
    icon: <PiUsers size={20} />,
    label: "Students",
    to: "/students",
    subMenu: [],
    privilege: "MANAGE_STUDENTS",
  },
  {
    icon: <PiUserCircle size={20} />,
    label: "Staff",
    to: "/staff",
    subMenu: [
      {
        label: "Staff Management",
        to: "/staff",
      },
      {
        label: "Access Requests",
        to: "/staff/requests",
      },
      {
        label: "User Types",
        to: "/staff/user-types",
      },
    ],
    privilege: "MANAGE_SYSTEM",
  },
  {
    icon: <PiWarning size={20} />,
    label: "Reports",
    to: "/reports",
    subMenu: [],
    conditionalVisibility: (privileges) => 
      privileges.includes("REPORT_DEVICE") || privileges.includes("STUDY_COURSE"),
  },
  {
    icon: <PiBellRinging size={20} />,
    label: "Lab Assistant",
    to: "/lab-assistant",
    subMenu: [
      {
        label: "Dashboard",
        to: "/lab-assistant",
      },
      {
        label: "Session Management",
        to: "/session-management",
      },
    ],
    conditionalVisibility: (privileges) => 
      privileges.includes("LAB_ASSISTANT") || privileges.includes("ASSIST_IN_COURSE"),
  },
  {
    icon: <PiBooks size={20} />,
    label: "Schedule",
    to: "/schedule",
    subMenu: [],
    conditionalVisibility: (privileges) => 
      privileges.includes("CREATE_STUDENT") || privileges.includes("STUDY_COURSE"),
  },
  {
    icon: <PiExam size={20} />,
    label: "My Exams",
    to: "/student/exams",
    subMenu: [],
    privilege: "STUDY_COURSE",
  },
  {
    icon: <PiChartBar size={20} />,
    label: "My Grades",
    to: "/grades",
    subMenu: [],
    privilege: "STUDY_COURSE",
    badge: {
      count: getNewGradesCount(),
      variant: "primary"
    }
  },
];

export const useSidebarLinks = () => {
  const privileges = useAuthStore((state) => state.user?.privileges || []);
  const hasPrivilege = useAuthStore((state) => state.hasPrivilege);
  const [links, setLinks] = useState<MenuItem[]>([]);

  // Get unresolved reports count for lab assistants
  const { data: unresolvedCountData } = useDeviceReportControllerGetMyUnresolvedReportsCount({
    query: {
      enabled: hasPrivilege("LAB_ASSISTANT") || hasPrivilege("ASSIST_IN_COURSE")
    }
  });
  const unresolvedCount = (unresolvedCountData as any)?.data?.count || 0;

  useEffect(() => {
    // Filter links based on user permissions
    const filteredLinks = allLinks.filter(link => {
      // Check if the link has a required privilege
      if (link.privilege) {
        return hasPrivilege(link.privilege);
      }
      
      // Check if the link has conditional visibility
      if (link.conditionalVisibility) {
        return link.conditionalVisibility(privileges);
      }
      
      // If the link is always visible or no permission check is specified
      return link.alwaysVisible || !link.privilege;
    });

    // Update badges where needed
    const linksWithUpdatedBadges = filteredLinks.map(link => {
      // Specific updates for certain links
      if (link.to === "/lab-assistant" && (hasPrivilege("LAB_ASSISTANT") || hasPrivilege("ASSIST_IN_COURSE"))) {
        return {
          ...link,
          badge: {
            count: unresolvedCount,
            variant: "danger" as const
          }
        };
      }
      if (link.to === "/grades") {
        return {
          ...link,
          badge: {
            count: getNewGradesCount(),
            variant: "primary" as const
          }
        };
      }
      return link;
    });

    setLinks(linksWithUpdatedBadges);
  }, [privileges, hasPrivilege, unresolvedCount]);

  return links;
};

export default useSidebarLinks;
