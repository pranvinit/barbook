import { configureStore } from "@reduxjs/toolkit";

// api imports
import { apiSlice } from "./apiSlice";

// reducer imports
import authReducer from "../../features/auth/model/authSlice";
import profileReducer from "../../features/profile/model/profileSlice";
import barsReducer from "../../features/bars/model/barsSlice";
import uiReducer from "../../features/ui/model/uiSlice";

// middleware imports
import { listenerMiddleware } from "./middleware/listenerMiddleware";
import { setupListeners } from "./listeners";

let listenersAreSetup = false;

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      bars: barsReducer,
      ui: uiReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware),
  });

  if (!listenersAreSetup) {
    setupListeners(listenerMiddleware.startListening);
    listenersAreSetup = true;
  }

  return store;
};
