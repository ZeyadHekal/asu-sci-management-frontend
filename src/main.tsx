import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "./providers/QueryClientProvider";
import { RouterProvider } from "react-router";
import router from "./routes/routes";
import "./index.css";
import App from "./App";
import Toaster from "./ui/toaster/Toaster";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App>
        <RouterProvider router={router} />
        <Toaster />
      </App>
    </QueryProvider>
  </StrictMode>
);
