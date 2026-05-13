"use client";

import { ToastBar, Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 2000,
        style: {
          borderRadius: "12px",
          boxShadow: "0 14px 40px rgba(15, 23, 42, 0.14)",
          color: "#0f172a",
          fontSize: "14px",
          fontWeight: 650,
        },
        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    >
      {(toast) => (
        <ToastBar
          toast={toast}
          style={{
            ...toast.style,
            animation: toast.visible
              ? "toast-enter 180ms ease-out"
              : "toast-exit 140ms ease-in forwards",
          }}
        />
      )}
    </Toaster>
  );
}
