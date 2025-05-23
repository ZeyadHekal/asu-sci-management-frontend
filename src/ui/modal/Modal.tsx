import { useEffect, useRef, ReactNode } from "react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to handle clicks on the backdrop
    const handleBackdropClick = (event: MouseEvent) => {
      // Only close if the click was directly on the backdrop element (not bubbled up)
      if (event.target === backdropRef.current) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener directly to the backdrop element instead of document
      backdropRef.current?.addEventListener("mousedown", handleBackdropClick);
    }

    return () => {
      // Clean up the event listener
      backdropRef.current?.removeEventListener(
        "mousedown",
        handleBackdropClick
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-[300px]",
    md: "w-[400px]",
    lg: "w-[600px]",
    xl: "w-[800px]",
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div
        ref={modalRef}
        className={`${sizeClasses[size]} rounded-lg bg-white shadow-lg dark:bg-black`}
      >
        <div className="mb-5 rounded-ss-lg rounded-se-lg flex items-center justify-between bg-[#FBFBFB] py-5 px-5">
          <h3 className="text-xl font-semibold text-[#0E1726]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <IoClose size={24} className="text-[#0E1726]" />
          </button>
        </div>
        <div className="px-5 pb-5">
          <div className="flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
