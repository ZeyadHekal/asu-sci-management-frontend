import { PropsWithChildren } from "react";
import { useThemeConfig } from "../../store/themeConfigStore";

const MainContainer = ({ children }: PropsWithChildren) => {
  const navbar = useThemeConfig((s) => s.navbar);

  return (
    <div
      className={`${navbar} main-container min-h-screen text-black dark:text-white-dark`}
    >
      {children}
    </div>
  );
};

export default MainContainer;
