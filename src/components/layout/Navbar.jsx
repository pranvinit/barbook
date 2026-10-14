"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, toggleTheme } from "@/features/ui/model/uiSlice";
import { useRouter } from "next/navigation";
import { signOut } from "@/features/auth/model/authSlice";
import { useSession } from "@/features/auth/useSession";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import "./navbar.css";

const LOGO_MESSAGES = [
  "Sab moh maya hai.",
  "Mera bhi kata hai, apka bhi katega.",
  "Mat has pagli pyar ho jayega.",
];

const Navbar = () => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const [logoHovered, setLogoHovered] = useState(false);
  const { user } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await dispatch(signOut());
    router.push("/login");
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(toggleTheme(newTheme));
  };

  // Only initialize typewriter when hovered
  const [text] = useTypewriter({
    words: LOGO_MESSAGES,
    loop: true,
    typeSpeed: 30,
    deleteSpeed: 10,
  });

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <a
          href="/"
          className="navbar-logo"
          aria-label="Home"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <span>😉</span>
          <span>🎀</span>
        </a>
        {logoHovered && (
          <p className="logo-text" suppressHydrationWarning={true}>
            {text}
            <Cursor cursorColor="#ff1694" />
          </p>
        )}
      </div>
      <div className="navbar-actions g-bg">
        {user && (
          <button className="sign-out g-fg" onClick={handleSignOut}>
            Sign out
          </button>
        )}
        <button
          className="theme-toggle g-fg"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <span role="img" aria-label="Dark mode">
              Dark <em>🌙</em>
            </span>
          ) : (
            <span role="img" aria-label="Light mode">
              Light <em>☀️</em>
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
