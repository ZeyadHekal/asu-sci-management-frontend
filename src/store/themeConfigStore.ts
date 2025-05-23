import { create } from "zustand";
import themeConfig, { ThemeConfigState } from "./theme.config";
import { devtools } from "zustand/middleware"; // Import devtools middleware

export const useThemeConfig = create<ThemeConfigState>()(
  devtools((set) => ({
    ...themeConfig,
    toggleLocale: (payload) => {
      const newLocale = payload || themeConfig.locale;
      localStorage.setItem("locale", newLocale);
      set({ locale: newLocale }, false, { type: "toggleLocale" });
    },
    toggleTheme: (payload) => {
      const newTheme = payload ?? themeConfig.theme;
      localStorage.setItem("theme", newTheme);
      set(
        () => {
          const isDark =
            newTheme === "dark" ||
            (newTheme === "system" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches);
          if (isDark) {
            document.body.classList.add("dark");
          } else {
            document.body.classList.remove("dark");
          }
          return { theme: newTheme, isDarkMode: isDark };
        },
        false, // Indicating no need for immediate rendering after the action
        { type: "toggleTheme" } // Name the action for devtools
      );
    },
    toggleMenu: (payload) => {
      const menu = payload ?? themeConfig.menu;
      localStorage.setItem("menu", menu);
      set({ menu }, false, { type: "toggleMenu" });
    },
    toggleLayout: (payload) => {
      const layout = payload ?? themeConfig.layout;
      localStorage.setItem("layout", layout);
      set({ layout }, false, { type: "toggleLayout" });
    },
    toggleRTL: (payload) => {
      const rtlClass = payload ?? themeConfig.rtlClass;
      localStorage.setItem("rtlClass", rtlClass);
      document.querySelector("html")?.setAttribute("dir", rtlClass || "ltr");
      set({ rtlClass }, false, { type: "toggleRTL" });
    },
    toggleAnimation: (payload) => {
      const animation = payload ?? themeConfig.animation;
      localStorage.setItem("animation", animation);
      set({ animation }, false, { type: "toggleAnimation" });
    },
    toggleNavbar: (payload) => {
      const navbar = payload ?? themeConfig.navbar;
      localStorage.setItem("navbar", navbar);
      set({ navbar }, false, { type: "toggleNavbar" });
    },
    toggleSemidark: (payload) => {
      const semidark = payload === true;
      localStorage.setItem("semidark", semidark ? "true" : "false");
      set({ semidark }, false, { type: "toggleSemidark" });
    },
    toggleSidebar: () =>
      set((state) => ({ sidebar: !state.sidebar }), false, {
        type: "toggleSidebar",
      }),
    resetToggleSidebar: () =>
      set({ sidebar: false }, false, { type: "resetToggleSidebar" }),
  }))
);
