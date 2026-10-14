import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "@/lib/redux/apiSlice";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const initialState = {
  status: "loading", // "loading" | "signedIn" | "signedOut"
  user: null, // { id, email }
};

export const signOut = createAsyncThunk("auth/signOut", async (_, { dispatch }) => {
  await getSupabaseBrowserClient().auth.signOut();
  dispatch(apiSlice.util.resetApiState());
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Driven by supabase.auth.onAuthStateChange (see AuthListener).
    sessionChanged: (state, action) => {
      state.user = action.payload;
      state.status = action.payload ? "signedIn" : "signedOut";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.status = "signedOut";
    });
  },
});

export const { sessionChanged } = authSlice.actions;

export const selectAuthStatus = (state) => state.auth.status;
export const selectUser = (state) => state.auth.user;

export default authSlice.reducer;
