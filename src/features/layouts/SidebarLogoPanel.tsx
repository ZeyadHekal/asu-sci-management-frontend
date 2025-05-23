import { Link } from "react-router";
import { useThemeConfig } from "../../store/themeConfigStore";
import { PiCaretDoubleDownLight } from "react-icons/pi";
import mathDeptLogo from "../../assets/images/math_dept_logo.png";

const SidebarLogoPanel = () => {
  const toggleSidebar = useThemeConfig((s) => s.toggleSidebar);
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Link to={"/"} className="main-logo flex shrink-0 items-center gap-3">
        <img
          src={mathDeptLogo}
          alt="Math Department Logo"
          className="h-12 w-12"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">
            Management System
          </span>
          <span className="text-xs text-white">Ain Shams University</span>
        </div>
      </Link>
      <button
        type="button"
        className="collapse-icon text-white  flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180"
        onClick={() => toggleSidebar()}
      >
        <PiCaretDoubleDownLight size={20} className="m-auto rotate-90" />
      </button>
    </div>
  );
};

export default SidebarLogoPanel;
