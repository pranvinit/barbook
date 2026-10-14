"use client";

import "./sign-in.css";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function callbackUrl(next) {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", next || "/notebook");
  return url.toString();
}

export default function SignInForm({ next, error: initialError }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState(
    initialError ? "That sign-in link didn't work. Try again." : ""
  );

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("sending");

    const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(next) },
    });

    if (error) {
      setError(error.message);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl(next) },
    });
    if (error) setError(error.message);
  };

  if (status === "sent") {
    return (
      <div className="sign-in g-bg">
        <h1>Check your inbox</h1>
        <p>
          We sent a sign-in link to <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="sign-in g-bg">
      <h1>Open your notebook</h1>
      <form onSubmit={handleMagicLink}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="g-fg"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="g-fg" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "Email me a link"}
        </button>
      </form>
      <div className="sign-in-divider">or</div>
      <button type="button" className="g-fg" onClick={handleGoogle}>
        Continue with Google
      </button>
      {error && (
        <p className="sign-in-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
