import { Toaster as ReactHotToast } from "react-hot-toast";

const Toaster = () => {
  return (
    <ReactHotToast
      position="top-center"
      toastOptions={{
        duration: 1500,
        style: {
          background: "#f0fdf4",
          color: "#166534",
          borderRadius: "3px",
          padding: "12px 16px",
          fontSize: "14px",
          borderLeft: "4px solid #22c55e",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          animation: "fade-in-out 1.8s forwards", // <-- NEW animation!
        },
        success: {
          style: {
            background: "#f0fdf4",
            color: "#166534",
            borderRadius: "3px",
            padding: "12px 16px",
            fontSize: "14px",
            borderLeft: "4px solid #22c55e",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            animation: "fade-in-out 1.8s forwards", // <-- success also
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: "3px",
            padding: "12px 16px",
            fontSize: "14px",
            borderLeft: "4px solid #ef4444",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            animation: "fade-in-out 1.8s forwards", // <-- error also
          },
        },
      }}
    />
  );
};

export default Toaster;
