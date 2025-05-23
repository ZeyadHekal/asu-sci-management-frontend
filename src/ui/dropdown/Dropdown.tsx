"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  ReactNode,
} from "react";
import { usePopper } from "react-popper";

type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

interface DropdownProps {
  button: ReactNode; // The button content can be any React node (text, component, etc.)
  children: ReactNode; // The content to be displayed in the dropdown
  btnClassName?: string; // Optional custom class for the button
  placement?: Placement; // Popper placement (e.g., 'bottom-end', 'top-start')
  offset?: [number, number]; // Offset for the popper position
}

interface DropdownHandle {
  close: () => void; // Method to close the dropdown from outside
}

const Dropdown = (
  props: DropdownProps,
  forwardedRef: React.Ref<DropdownHandle>
) => {
  const [visibility, setVisibility] = useState<boolean>(false);

  const referenceRef = useRef<HTMLButtonElement | null>(null);
  const popperRef = useRef<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: props.placement || "bottom-end",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: props.offset || [0, 8],
          },
        },
      ],
    }
  );

  const handleDocumentClick = (event: MouseEvent) => {
    if (
      referenceRef.current?.contains(event.target as Node) ||
      popperRef.current?.contains(event.target as Node)
    ) {
      return;
    }

    setVisibility(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  useImperativeHandle(forwardedRef, () => ({
    close() {
      setVisibility(false);
    },
  }));

  return (
    <>
      <button
        ref={referenceRef}
        type="button"
        className={props.btnClassName}
        onClick={() => setVisibility(!visibility)}
      >
        {props.button}
      </button>

      <div
        ref={popperRef}
        style={styles.popper}
        {...attributes.popper}
        className={`z-[100] transition-all duration-200 ease-in-out ${
          visibility
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="transform transition-all duration-200 ease-in-out">
          {props.children}
        </div>
      </div>
    </>
  );
};

export default forwardRef(Dropdown);
