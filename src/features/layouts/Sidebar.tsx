import { useEffect } from "react";
import { useThemeConfig } from "../../store/themeConfigStore";
import { useLocation, useNavigate } from "react-router";
import SidebarScrollPanel from "./SidebarScrollPanel";
import SidebarLogoPanel from "./SidebarLogoPanel";
import { FiLogOut } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { useWebSocket } from "../../services/websocketService";

const Sidebar = () => {
  const pathname = useLocation();
  const sidebar = useThemeConfig((s) => s.sidebar);
  const toggleSidebar = useThemeConfig((s) => s.toggleSidebar);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { disconnect: disconnectWebSocket } = useWebSocket();

  const handleLogout = () => {
    disconnectWebSocket();
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (window.innerWidth < 1024 && sidebar) {
      toggleSidebar();
    }
  }, [pathname]);

  return (
    <div>
      <nav className="sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] bg-secondary flex flex-col shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <SidebarLogoPanel />
          <SidebarScrollPanel />
        </div>
        <div className="pe-5 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-white text-base font-medium py-2.5 pl-4 rounded-e-2xl hover:bg-white/10 transition-colors duration-200"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
