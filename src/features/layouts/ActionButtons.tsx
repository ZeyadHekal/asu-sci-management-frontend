import { PiBooks } from "react-icons/pi";
import { FaRegEdit, FaRegComment } from "react-icons/fa";
import { IconType } from "react-icons";
import { cn } from "../../global/utils/cn";

interface ActionButton {
  icon: IconType;
  onClick?: () => void;
}

const actionButtons: ActionButton[] = [
  {
    icon: PiBooks,
    onClick: () => console.log("Courses clicked"),
  },
  {
    icon: FaRegEdit,
    onClick: () => console.log("Edit clicked"),
  },
  {
    icon: FaRegComment,
    onClick: () => console.log("Comment clicked"),
  },
];

interface ActionButtonsProps {
  variant?: "header" | "sidebar";
}

const ActionButtons = ({ variant = "header" }: ActionButtonsProps) => {
  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-3",
        variant === "sidebar" && "flex sm:hidden"
      )}
    >
      {actionButtons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className="w-9 h-9 rounded-full bg-[#E0E6ED]/40 flex items-center justify-center hover:bg-[#E0E6ED]/60 transition-colors duration-200"
        >
          <button.icon size={20} className="text-[#0E1726]" />
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
