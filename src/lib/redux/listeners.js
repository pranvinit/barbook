import { isRejectedWithValue } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import { toast } from "react-toastify";

export function setupListeners(startListening) {
  if (typeof window === "undefined") return;

  startListening({
    matcher: apiSlice.endpoints.createBar.matchFulfilled,
    effect: async (action) => {
      toast.success(`Scored ${action.payload.overall}/10`);
    },
  });

  startListening({
    matcher: apiSlice.endpoints.updateBar.matchFulfilled,
    effect: async (action) => {
      toast.success(`Rewrite scored ${action.payload.overall}/10`);
    },
  });

  startListening({
    matcher: apiSlice.endpoints.deleteBar.matchFulfilled,
    effect: async () => {
      toast.info("Bar deleted");
    },
  });

  // Surface API errors (quota, validation, AI failures) from any request.
  startListening({
    predicate: (action) => isRejectedWithValue(action),
    effect: async (action) => {
      const message = action.payload?.data?.error;
      if (message) toast.error(message);
    },
  });
}
