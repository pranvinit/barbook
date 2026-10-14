"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, toggleTheme } from "@/features/ui/model/uiSlice";
import { useRouter } from "next/navigation";
import { signOut } from "@/features/auth/model/authSlice";
import { useSession } from "@/features/auth/useSession";
import "./navbar.css";

const Navbar = () => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const { user, isLoading } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await dispatch(signOut());
    router.push("/login");
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(toggleTheme(newTheme));
  };

  return (
    <nav className="navbar" aria-label="Main">
      <Link href="/" className="navbar-logo" aria-label="Barbook home">
        <span className="navbar-wordmark">Barbook</span>
      </Link>
      <div className="navbar-actions">
        {user && (
          <Link href="/notebook" className="nav-pill g-fg">
            Notebook
          </Link>
        )}
        {!user && !isLoading && (
          <Link href="/login" className="nav-pill g-fg">
            Sign in
          </Link>
        )}
        {user && (
          <button className="nav-pill g-fg" onClick={handleSignOut}>
            Sign out
          </button>
        )}
        <button
          className="nav-pill g-fg"
          onClick={handleThemeToggle}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
