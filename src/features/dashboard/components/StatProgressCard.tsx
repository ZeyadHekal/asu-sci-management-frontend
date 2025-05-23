import React from "react";

interface StatProgressCardProps {
  title: string;
  subtitle: string;
  progress: number; // 0-100
  progressLabel?: string;
  topRight?: React.ReactNode;
  menu?: React.ReactNode;
}

const StatProgressCard: React.FC<StatProgressCardProps> = ({
  title,
  subtitle,
  progress,
  progressLabel,
  topRight,
  menu,
}) => {
  return (
    <div className="panel h-[216px] flex flex-col justify-between p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xl font-semibold text-gray-700">{title}</div>
        <div className="flex items-center gap-2">
          {topRight && (
            <span className="text-xs text-gray-900 font-medium">
              {topRight}
            </span>
          )}
          {menu && (
            <button className="text-gray-400 hover:text-gray-600">
              {menu}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-2xl font-bold text-secondary mb-2">{subtitle}</div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6ED566] to-secondary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {progressLabel && (
            <span className="text-xs text-gray-700 font-semibold min-w-[32px] text-right">
              {progressLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatProgressCard;
