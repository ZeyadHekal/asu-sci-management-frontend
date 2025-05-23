import { IoIosMenu } from "react-icons/io";
import { Link } from "react-router";
import logo from "../../../src/assets/images/math_dept_logo.png";
import { useThemeConfig } from "../../store/themeConfigStore";

const NavHeaderLogo = () => {
  const toggleSidebar = useThemeConfig((s) => s.toggleSidebar);
  return (
    <div className="horizontal-logo flex items-center gap-2 justify-between lg:hidden">
      <Link to={"/"} className="main-logo flex shrink-0 items-center">
        <img src={logo} alt="Math Department Logo" className="w-12" />
      </Link>
      <button
        type="button"
        className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-secondary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-secondary lg:hidden"
        onClick={() => toggleSidebar()}
      >
        <IoIosMenu className="h-5 w-5" />
      </button>
    </div>
  );
};

export default NavHeaderLogo;
