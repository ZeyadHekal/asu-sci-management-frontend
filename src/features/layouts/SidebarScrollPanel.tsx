import PerfectScrollbar from "react-perfect-scrollbar";
import { useSidebarLinks } from "./SidebarLinks";
import { NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import ActionButtons from "./ActionButtons";

const SidebarScrollPanel = () => {
  const sidebarLinks = useSidebarLinks();
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const location = useLocation();

  // Open submenu if current location matches one of its items
  useEffect(() => {
    const currentPath = location.pathname;
    let foundMatch = false;
    
    for (const menu of sidebarLinks) {
      if (menu.subMenu.length > 0) {
        // Check if current path matches any submenu item
        const matchingSubmenuItem = menu.subMenu.find(submenu => 
          currentPath === submenu.to || 
          (currentPath.startsWith(submenu.to) && submenu.to !== '/')
        );
        
        if (matchingSubmenuItem) {
          setActiveSubMenu(menu.label);
          foundMatch = true;
          break;
        }
      }
    }
    
    // If no match found, close all submenus
    if (!foundMatch) {
      setActiveSubMenu(null);
    }
  }, [location.pathname, sidebarLinks]);

  const toggleSubMenu = (label: string) => {
    setActiveSubMenu(prevState => prevState === label ? null : label);
  };

  return (
    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
      <ul className="relative flex flex-col gap-2 py-5 pe-5 font-medium">
        {sidebarLinks.map((menu) => (
          <li key={menu.label} className="menu nav-item">
            {menu.subMenu.length > 0 ? (
              <>
                <button 
                  type="button" 
                  onClick={() => toggleSubMenu(menu.label)}
                  className="flex w-full items-center rounded-md p-2.5 text-white hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  <span className="shrink-0 text-lg">{menu.icon}</span>
                  <span className="pl-2">{menu.label}</span>
                  <span className="ml-auto">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d={activeSubMenu === menu.label ? "M19 8.5L12 15.5L5 8.5" : "M19 15.5L12 8.5L5 15.5"}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                
                {activeSubMenu === menu.label && (
                  <ul className="sub-menu rounded-md bg-white py-2 text-sm font-medium shadow-md">
                    {menu.subMenu.map((submenu) => (
                      <li key={submenu.label}>
                        <NavLink 
                          to={submenu.to}
                          className={({ isActive }) => 
                            `flex w-full items-center px-4 py-2 hover:bg-gray-50 hover:text-primary transition-all duration-200 ${
                              isActive ? 'bg-gray-50 text-primary' : ''
                            }`
                          }
                        >
                          {submenu.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <NavLink 
                to={menu.to}
                className={({ isActive }) =>
                  `flex items-center rounded-md p-2.5 text-white hover:bg-white/10 hover:text-white transition-all duration-300 ${
                    isActive ? 'bg-white/20 text-white shadow font-semibold' : ''
                  }`
                }
              >
                <span className="shrink-0 text-lg">{menu.icon}</span>
                <span className="pl-2">{menu.label}</span>
                {menu.badge && menu.badge.count > 0 && (
                  <span className={`ml-auto px-1.5 py-0.5 rounded-full text-xs font-semibold ${menu.badge.variant === 'danger' ? 'bg-red-500 text-white' :
                    menu.badge.variant === 'warning' ? 'bg-yellow-500 text-white' :
                      menu.badge.variant === 'success' ? 'bg-green-500 text-white' :
                        'bg-primary text-white'
                    }`}>
                    {menu.badge.count}
                  </span>
                )}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
      <div className="px-4 py-2">
        <ActionButtons variant="sidebar" />
      </div>
    </PerfectScrollbar>
  );
};

export default SidebarScrollPanel;
