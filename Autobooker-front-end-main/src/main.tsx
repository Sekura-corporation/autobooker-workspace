import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.tsx";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          background: "#FFFFFF",
          color: "#0F172A",
        },
        success: {
          style: {
            background: "#EBFBEE",
            color: "#2e7d32",
          },
          iconTheme: {
            primary: "#2e7d32",
            secondary: "#EBFBEE",
          },
        },
        error: {
          style: {
            background: "#FFF0F0",
            color: "#c62828",
          },
          iconTheme: {
            primary: "#c62828",
            secondary: "#FFF0F0",
          },
        },
      }}
    />
  </StrictMode>,
);
