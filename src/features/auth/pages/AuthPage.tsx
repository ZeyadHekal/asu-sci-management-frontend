import { useEffect } from "react";
import AuthCard from "../components/AuthCard";
import UniversityAsuLogo from "../../../assets/images/ain_shams_logo.png";
import MathLogo from "../../../assets/images/math_dept_logo.png";
import ScienceLogo from "../../../assets/images/science_logo.png";

const AuthPage = () => {
  useEffect(() => {
    document.title = "Login | Management System";
  }, []);

  return (
    <div className="bg-primary-300 min-h-screen w-screen p-4 md:p-8 flex items-center justify-center">
      <div className="w-full h-[600px] max-w-[1400px] bg-primary-100 rounded-lg overflow-hidden">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[50%_1fr]">
          <div className="hidden skew-x-[10deg] -translate-x-20 lg:flex bg-gradient-to-br from-secondary to-secondary-600 flex-col items-center justify-center relative overflow-hidden">
            <div className="flex items-center skew-x-[-10deg] flex-col gap-20">
              <div className="flex gap-20">
                <img
                  src={UniversityAsuLogo}
                  alt="ASU Logo"
                  className="w-[100px] h-[100px] xl:w-[200px] xl:h-[200px]"
                />
                <img
                  src={ScienceLogo}
                  alt="Science Faculty Logo"
                  className="w-[100px] h-[100px] xl:w-[200px] xl:h-[200px]"
                />
              </div>
              <img
                src={MathLogo}
                alt="Math Department Logo"
                className="w-[100px] h-[100px] xl:w-[200px] xl:h-[200px]"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-secondary-700 to-transparent opacity-40" />
          </div>
          <div className="bg-primary-100 flex flex-col items-center justify-end p-4 lg:px-0">
            <AuthCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
