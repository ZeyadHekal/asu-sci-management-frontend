import { useEffect, useState } from "react";
import { useThemeConfig } from "../../store/themeConfigStore";
import { useLocation } from "react-router";

const ContentAnimation = ({ children }: { children: React.ReactNode }) => {
  const pathname = useLocation();
  const themeConfigAnimation = useThemeConfig((s) => s.animation);
  const [animation, setAnimation] = useState(themeConfigAnimation);

  useEffect(() => {
    setAnimation(themeConfigAnimation);
  }, [themeConfigAnimation]);

  useEffect(() => {
    setAnimation(themeConfigAnimation);
    setTimeout(() => {
      setAnimation("");
    }, 1100);
  }, [pathname]);
  
  return (
    <>
      {/* BEGIN CONTENT AREA */}
      <div className={`${animation} animate__animated p-6 pt-8`}>{children}</div>
      {/* END CONTENT AREA */}
    </>
  );
};

export default ContentAnimation;
