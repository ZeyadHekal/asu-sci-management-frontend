import { useThemeConfig } from "../../store/themeConfigStore";

const SidebarOverlay = () => {
  const sidebar = useThemeConfig((s) => s.sidebar);
  const toggleSidebar = useThemeConfig((s) => s.toggleSidebar);

  return (
    <div
      className={`${
        (!sidebar && "hidden") || ""
      } fixed inset-0 z-50 bg-[black]/60 lg:hidden`}
      onClick={() => toggleSidebar()}
    />
  );
};

export default SidebarOverlay;
