"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiSlice } from "@/lib/redux/apiSlice";
import { sessionChanged } from "../model/authSlice";

// Mirrors the Supabase session into Redux. Fires once on load
// (INITIAL_SESSION) and again on every sign-in, sign-out and refresh.
export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const {
      data: { subscription },
    } = getSupabaseBrowserClient().auth.onAuthStateChange((event, session) => {
      const user = session?.user ? { id: session.user.id, email: session.user.email } : null;
      dispatch(sessionChanged(user));
      if (event === "SIGNED_OUT") {
        dispatch(apiSlice.util.resetApiState());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return null;
}
