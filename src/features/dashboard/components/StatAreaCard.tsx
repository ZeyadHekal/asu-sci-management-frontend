import React from "react";

interface StatAreaCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  gradientFrom: string;
  gradientTo: string;
  areaPath?: string;
}

const DEFAULT_AREA_PATH =
  "M15 160C6.71572 160 0 153.284 0 145V100.333C0 92.049 7.02006 84.152 12.6922 78.1141C27.4213 62.4351 41.1803 26.6667 56.6667 26.6667C76.5 26.6667 93.5 64 113.333 64C133.167 64 150.167 0 170 0C189.833 0 206.833 58.6667 226.667 58.6667C246.5 58.6667 263.5 21.3333 283.333 21.3333C298.447 21.3333 311.916 43.0131 326.246 53.3308C332.969 58.1712 340 65.3715 340 73.6558C340 85.5287 340 106.806 340 144.938C340 153.222 333.284 160 325 160H15Z";

const StatAreaCard: React.FC<StatAreaCardProps> = ({
  icon,
  title,
  value,
  gradientFrom,
  gradientTo,
  areaPath,
}) => {
  return (
    <div className="panel h-[270px] p-0 relative flex flex-col justify-between overflow-hidden">
      <div className="flex p-5 items-center justify-between">
        <div className="flex items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            {icon}
          </div>
          <div className="font-semibold ltr:ml-3 rtl:mr-3">
            <h5 className="text-xl text-secondary">{title}</h5>
          </div>
        </div>
        <div className="font-semibold ltr:ml-3 rtl:mr-3">
          <p className="text-xl text-gray-900">{value}</p>
        </div>
      </div>
      <div className="absolute -bottom-3 w-full h-40">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 340 160"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={areaPath || DEFAULT_AREA_PATH}
            fill="url(#statAreaGradient)"
          />
          <defs>
            <linearGradient
              id="statAreaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="160"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={gradientFrom} stopOpacity="0.4225" />
              <stop offset="1" stopColor={gradientTo} stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default StatAreaCard;
