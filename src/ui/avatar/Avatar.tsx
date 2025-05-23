import React from "react";
import { cn } from "../../global/utils/cn";
import noPic from "../../assets/images/NoProfilePicture.png";

type AvatarProps = {
  size: 9 | 10 | 12 | 14 | 16 | 20 | 24 | 28 | 32; // Tailwind's size class numbers (example: w-12, w-16, etc.)
  status?: "success" | "danger" | "info" | "primary" | "secondary"; // Optional status for a colored ring
  shape?: "circle" | "square" | "rounded"; // Optional shape for the avatar (circle, square, rounded)
  imageSrc?: string; // Optional image source
  text?: string; // Optional text for initials or content
  multiple?: boolean; // For displaying multiple avatars
  className?: string; // Optional className for additional customization
};

const Avatar: React.FC<AvatarProps> = ({
  size,
  status,
  shape = "circle",
  imageSrc,
  text,
  multiple = false,
  className,
}) => {
  const baseClasses = "overflow-hidden object-cover";
  let ringClasses = "";
  let bgClasses = "bg-primary"; // Default background color for text avatars

  // Determine shape classes
  const shapeClasses =
    shape === "square"
      ? "rounded-none"
      : shape === "rounded"
      ? "rounded-md"
      : "rounded-full";

  // Add ring based on status
  if (status) {
    ringClasses = `absolute bottom-0 right-0 w-6 h-6 rounded-full ring-2 ring-white dark:ring-white-dark bg-${status}`;
    bgClasses = `bg-${status}`; // Override default background with status color
  }

  // Avatar content (image or initials)
  const avatarContent = (
    <img
      className={cn(
        `w-${size} h-${size}`,
        shapeClasses,
        baseClasses,
        className
      )} // Merge className here
      src={imageSrc || noPic} // Use the imported fallback image
      alt="Avatar"
    />
  );

  const textAvatarContent = (
    <span
      className={cn(
        "flex justify-center items-center capitalize",
        `w-${size}`,
        `h-${size}`,
        shapeClasses,
        baseClasses,
        bgClasses,
        "text-white text-xl",
        className // Merge className here as well
      )}
    >
      {text}
    </span>
  );

  if (multiple) {
    return (
      <div className="flex items-center justify-center -space-x-4 rtl:space-x-reverse text-white">
        {avatarContent}
        {avatarContent}
        {avatarContent}
      </div>
    );
  }

  return (
    <div className="relative">
      {!imageSrc && text ? textAvatarContent : avatarContent}
      {status && <span className={ringClasses}></span>}
    </div>
  );
};

export default Avatar;
