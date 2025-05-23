export type Theme = "light" | "dark" | "system";
export type Menu = "vertical" | "collapsible-vertical" | "horizontal";
export type Layout = "full" | "boxed-layout";
export type RtlClass = "ltr" | "rtl";
export type Animation =
  | ""
  | "animate__fadeIn"
  | "animate__fadeInDown"
  | "animate__fadeInUp"
  | "animate__fadeInLeft"
  | "animate__fadeInRight"
  | "animate__slideInDown"
  | "animate__slideInLeft"
  | "animate__slideInRight"
  | "animate__zoomIn";
export type Navbar = "navbar-sticky" | "navbar-floating" | "navbar-static";
export type Locale = "en" | "es";
export interface Language {
  code: Locale;
  name: string;
}

export interface ThemeConfig {
  locale: Locale;
  theme: Theme;
  menu: Menu;
  layout: Layout;
  rtlClass: RtlClass;
  animation: Animation;
  navbar: Navbar;
  semidark: boolean;
  isDarkMode: boolean;
  sidebar: boolean;
  languageList: Language[];
}

export interface ThemeConfigState extends ThemeConfig {
  toggleLocale: (payload: Locale) => void;
  toggleTheme: (payload?: Theme) => void;
  toggleMenu: (payload?: Menu) => void;
  toggleLayout: (payload?: Layout) => void;
  toggleRTL: (payload?: RtlClass) => void;
  toggleAnimation: (payload?: Animation) => void;
  toggleNavbar: (payload?: Navbar) => void;
  toggleSemidark: (payload?: boolean) => void;
  toggleSidebar: () => void;
  resetToggleSidebar: () => void;
}

const themeConfig: ThemeConfig = {
  locale: "en",
  theme: "light",
  menu: "vertical",
  layout: "full",
  rtlClass: "ltr",
  animation: "",
  navbar: "navbar-sticky",
  semidark: false,
  isDarkMode: false,
  sidebar: false,
  languageList: [{ code: "en", name: "English" }],
};

export default themeConfig;
