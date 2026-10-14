import { isRejectedWithValue } from "@reduxjs/toolkit";
// Import the injected endpoints directly so they exist on every page,
// not only on pages that happen to load the feature APIs first.
import { apiSliceWithBars } from "@/features/bars/api/barsApi";
import { toast } from "react-toastify";

export function setupListeners(startListening) {
  if (typeof window === "undefined") return;

  startListening({
    matcher: apiSliceWithBars.endpoints.createBar.matchFulfilled,
    effect: async (action) => {
      toast.success(`Scored ${action.payload.overall}/10`);
    },
  });

  startListening({
    matcher: apiSliceWithBars.endpoints.updateBar.matchFulfilled,
    effect: async (action) => {
      toast.success(`Rewrite scored ${action.payload.overall}/10`);
    },
  });

  startListening({
    matcher: apiSliceWithBars.endpoints.deleteBar.matchFulfilled,
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
