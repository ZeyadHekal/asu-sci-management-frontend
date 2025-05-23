import React from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
    variant = "primary",
    children,
    className = ""
}) => {
    const variantClasses = {
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        success: "bg-green-500 text-white",
        danger: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-blue-500 text-white"
    };

    return (
        <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge; 