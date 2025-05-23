import { PropsWithChildren, useEffect, useState } from "react";
import { useThemeConfig } from "./store/themeConfigStore";
import {
  Theme,
  Menu,
  Layout,
  RtlClass,
  Navbar,
  Animation,
  Locale,
} from "./store/theme.config";
import WebSocketProvider from "./services/WebSocketProvider";
import WebSocketStatusIndicator from "./features/common/WebSocketStatus";
import { useAuthStore } from "./store/authStore";
import { useAuth } from "./global/hooks/useAuth";

const App = ({ children }: PropsWithChildren) => {
  const themeConfig = useThemeConfig();
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { refreshPrivileges, refreshExamModeStatus } = useAuth();

  useEffect(() => {
    themeConfig.toggleTheme(
      (localStorage.getItem("theme") as Theme) || themeConfig.theme
    );
    themeConfig.toggleMenu(
      (localStorage.getItem("menu") as Menu) || themeConfig.menu
    );
    themeConfig.toggleLayout(
      (localStorage.getItem("layout") as Layout) || themeConfig.layout
    );
    themeConfig.toggleRTL(
      (localStorage.getItem("rtlClass") as RtlClass) || themeConfig.rtlClass
    );
    themeConfig.toggleAnimation(
      (localStorage.getItem("animation") as Animation) || themeConfig.animation
    );
    themeConfig.toggleNavbar(
      (localStorage.getItem("navbar") as Navbar) || themeConfig.navbar
    );
    themeConfig.toggleSemidark(
      Boolean(localStorage.getItem("semidark")) || themeConfig.semidark
    );
    themeConfig.toggleLocale(
      (localStorage.getItem("locale") as Locale) || themeConfig.locale
    );

    setIsLoading(false);
  }, [
    themeConfig.theme,
    themeConfig.menu,
    themeConfig.layout,
    themeConfig.rtlClass,
    themeConfig.animation,
    themeConfig.navbar,
    themeConfig.locale,
    themeConfig.semidark,
  ]);

  // Only refresh privileges and exam mode status once on initial mount if authenticated
  useEffect(() => {
    const isAuth = useAuthStore.getState().isAuthenticated();
    if (isAuth) {
      refreshPrivileges();
      refreshExamModeStatus();
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  return (
    <div
      className={`${(themeConfig.sidebar && "toggle-sidebar") || ""} ${
        themeConfig.menu
      } ${themeConfig.layout} ${
        themeConfig.rtlClass
      } main-section relative font-nunito text-sm font-normal antialiased`}
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <WebSocketProvider>
          {children}
          {isAuthenticated && <WebSocketStatusIndicator />}
        </WebSocketProvider>
      )}
    </div>
  );
};

export default App;
