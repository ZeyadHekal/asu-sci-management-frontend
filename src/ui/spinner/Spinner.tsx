import { cn } from "../../global/utils/cn";

interface Props {
  size?: "small" | "default" | "large";
  variant?: "default" | "secondary" | "primary" | "info";
  className?: string;
}

const Spinner = ({
  size = "default",
  variant = "default",
  className = "",
}: Props) => {
  // Size classes based on small, default, and large
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-10 h-10",
    large: "w-12 h-12",
  };

  // Spinner variant styles
  const spinnerVariants = {
    default: "animate-spin border-4 border-primary border-l-transparent",
    secondary:
      "animate-spin border-4 border-secondary-500 border-l-transparent",
    primary: "animate-spin border-4 border-transparent border-l-primary",
    info: "animate-ping inline-flex h-full w-full rounded-full bg-info", // For pulsing spinner
  };

  return (
    <div
      className={`${
        sizeClasses[size]
      } border-4 rounded-full flex items-center justify-center ${cn(
        spinnerVariants[variant],
        className
      )}`}
    />
  );
};

export default Spinner;
