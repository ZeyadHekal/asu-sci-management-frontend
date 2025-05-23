import React from "react";
import { cn } from "../../../global/utils/cn";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  percent: string;
  comparison: string;
  color: string; // For icon and text
  gradientId: string; // Unique for each card
  gradientColors: { from: string; to: string };
}

const iconBgMap: Record<string, string> = {
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
  yellow: "bg-yellow-100 text-yellow-600",
};
const percentTextMap: Record<string, string> = {
  green: "text-green-600",
  red: "text-red-600",
  blue: "text-blue-600",
  yellow: "text-yellow-600",
};

const UpIcon = ({ color }: { color: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    className="inline mr-1 align-middle"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.6679 7C15.6679 6.58579 16.0036 6.25 16.4179 6.25H22C22.4142 6.25 22.75 6.58579 22.75 7V12.5458C22.75 12.96 22.4142 13.2958 22 13.2958C21.5858 13.2958 21.25 12.96 21.25 12.5458V8.80286L15.1142 14.9013C14.6452 15.3674 14.241 15.7692 13.8739 16.0477C13.4804 16.3462 13.0432 16.572 12.505 16.572C11.9668 16.5719 11.5297 16.346 11.1362 16.0474C10.7692 15.7688 10.3651 15.367 9.89629 14.9007L9.62203 14.628C9.10787 14.1167 8.77452 13.7875 8.49695 13.5769C8.23672 13.3794 8.11506 13.3573 8.03449 13.3574C7.95393 13.3574 7.83228 13.3795 7.57219 13.5772C7.29478 13.7881 6.96167 14.1175 6.44789 14.6292L2.52922 18.5314C2.23571 18.8237 1.76084 18.8227 1.46856 18.5292C1.17628 18.2357 1.17728 17.7608 1.47078 17.4686L5.42433 13.5315C5.89326 13.0645 6.29742 12.662 6.66452 12.383C7.05802 12.0839 7.49535 11.8576 8.03395 11.8574C8.57254 11.8572 9.01003 12.0832 9.40375 12.382C9.77105 12.6607 10.1755 13.063 10.6448 13.5296L10.919 13.8024C11.4327 14.3132 11.7658 14.6421 12.0431 14.8526C12.3031 15.0499 12.4247 15.072 12.5052 15.072C12.5857 15.072 12.7073 15.0499 12.9673 14.8527C13.2447 14.6423 13.5778 14.3134 14.0916 13.8027L20.1815 7.75H16.4179C16.0036 7.75 15.6679 7.41421 15.6679 7Z"
      fill={color}
    />
  </svg>
);
const DownIcon = ({ color }: { color: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    className="inline mr-1 align-middle"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.6679 17C15.6679 17.4142 16.0036 17.75 16.4179 17.75H22C22.4142 17.75 22.75 17.4142 22.75 17V11.4542C22.75 11.04 22.4142 10.7042 22 10.7042C21.5858 10.7042 21.25 11.04 21.25 11.4542V15.1971L15.1142 9.09871C14.6452 8.63256 14.241 8.23077 13.8739 7.95229C13.4804 7.65378 13.0432 7.42796 12.505 7.42802C11.9668 7.42808 11.5297 7.654 11.1362 7.9526C10.7692 8.23116 10.3651 8.63303 9.89629 9.09928L9.62203 9.37199C9.10787 9.88325 8.77452 10.2125 8.49695 10.4231C8.23672 10.6206 8.11506 10.6427 8.03449 10.6426C7.95393 10.6426 7.83228 10.6205 7.57219 10.4228C7.29478 10.2119 6.96167 9.88247 6.44789 9.37083L2.52922 5.46856C2.23571 5.17628 1.76084 5.17728 1.46856 5.47078C1.17628 5.76429 1.17728 6.23916 1.47078 6.53144L5.42433 10.4685C5.89326 10.9355 6.29742 11.338 6.66452 11.617C7.05802 11.9161 7.49535 12.1424 8.03395 12.1426C8.57254 12.1428 9.01003 11.9168 9.40375 11.618C9.77105 11.3393 10.1755 10.937 10.6448 10.4704L10.919 10.1976C11.4327 9.68684 11.7658 9.35791 12.0431 9.14743C12.3031 8.95011 12.4247 8.92803 12.5052 8.92802C12.5857 8.92801 12.7073 8.95006 12.9673 9.14732C13.2447 9.35774 13.5778 9.68659 14.0916 10.1973L20.1815 16.25H16.4179C16.0036 16.25 15.6679 16.5858 15.6679 17Z"
      fill={color}
    />
  </svg>
);

function parsePercent(percent: string): number {
  const match = percent.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  percent,
  comparison,
  color,
  gradientId,
  gradientColors,
}) => {
  const percentValue = parsePercent(percent);
  const isUp = percentValue >= 50;
  return (
    <div
      className={cn(
        "panel flex flex-col justify-between min-h-[140px] overflow-hidden bg-white"
      )}
    >
      {/* Decorative SVG backgrounds (two layers, full width) */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none z-0">
        <svg
          viewBox="0 0 306 124"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="absolute left-0 bottom-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id={`${gradientId}-1`}
              x1="153"
              y1="0.953125"
              x2="153"
              y2="152.953"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={gradientColors.from} />
              <stop
                offset="1"
                stopColor={gradientColors.from}
                stopOpacity="0.37"
              />
            </linearGradient>
          </defs>
          <path
            opacity="0.2"
            d="M61.7868 85.3076C36.1894 120.448 12.0631 124.353 0 126.012V152.953H305.992V0.97029C306.286 0.482227 298.872 10.224 266.86 53.0954C226.846 106.685 185.949 87.3575 164.765 58.9522C147.818 36.228 130.635 29.9613 124.162 29.6684C108.862 28.4971 87.3842 50.1671 61.7868 85.3076Z"
            fill={`url(#${gradientId}-1)`}
          />
        </svg>
        <svg
          viewBox="0 0 306 97"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="absolute left-0 bottom-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id={`${gradientId}-2`}
              x1="153"
              y1="0.953125"
              x2="153"
              y2="125.953"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={gradientColors.to} />
              <stop
                offset="1"
                stopColor={gradientColors.to}
                stopOpacity="0.37"
              />
            </linearGradient>
          </defs>
          <path
            opacity="0.2"
            d="M63.7255 103.308C38.8226 105.896 10.8656 84.9762 0 74.1927V125.953H306V54.1944C286.912 31.8433 251.965 1.55172 222.012 0.963538C192.058 0.375351 168.858 24.7851 142.134 54.1944C115.411 83.6037 94.8541 100.073 63.7255 103.308Z"
            fill={`url(#${gradientId}-2)`}
          />
        </svg>
      </div>
      {/* Card Content */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div
          className={cn(
            "rounded-full p-2 flex items-center justify-center text-lg",
            iconBgMap[color] || iconBgMap.green
          )}
        >
          {icon}
        </div>
        <div className="flex-1 flex flex-col justify-start">
          <div className="font-semibold text-xl text-gray-900">{title}</div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 ml-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
      <div className="relative z-10 flex flex-col items-start gap-3">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center text-xs">
          {isUp ? (
            <UpIcon color={gradientColors.from} />
          ) : (
            <DownIcon color={gradientColors.from} />
          )}
          <span
            className={cn(
              percentTextMap[color] || percentTextMap.green,
              "font-semibold me-1"
            )}
          >
            {percent}
          </span>
          <span className="text-gray-900">{comparison}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
