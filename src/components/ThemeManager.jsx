"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { selectTheme, setTheme } from "@/features/ui/model/uiSlice";

// Mounted once in the root layout: restores the theme and hosts toasts.
const ThemeManager = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  // Restore the saved theme on load (localStorage first, then system preference).
  useEffect(() => {
    let next = null;
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") next = stored;
    } catch (e) {
      // storage unavailable (private mode, blocked); fall through to system preference
    }
    if (!next) {
      next = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
        ? "dark"
        : "light";
    }
    document.documentElement.dataset.theme = next;
    dispatch(setTheme(next));
  }, [dispatch]);

  return (
    <ToastContainer
      position="top-left"
      autoClose={3000}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      toastClassName="custom-toast"
    />
  );
};

export default ThemeManager;
