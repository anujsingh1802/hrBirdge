import { Link, useNavigate } from "react-router";
import { Briefcase, User, Menu, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  variant?: "public" | "authenticated";
}

export function Navbar({ variant = "public" }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const isAuthedView = variant === "authenticated" || isAuthenticated;

  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="h-[var(--height-navbar)] md:h-[var(--height-navbar)] bg-white/80 backdrop-blur-xl border-b border-[var(--border-soft)] sticky top-0 z-50" style={{ boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)' }}>
      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)] h-full flex items-center justify-between gap-4"
        style={{ animation: 'fadeInUp 0.5s ease both' }}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Minds Solutions" className="h-12 w-auto object-contain drop-shadow-sm brightness-0" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/jobs" className="text-[var(--text-default)] hover:text-[var(--text-strong)] transition-colors">
            Find Jobs
          </Link>
          <Link to="/#how-it-works" className="text-[var(--text-default)] hover:text-[var(--text-strong)] transition-colors">
            How It Works
          </Link>
          <Link to="/#categories" className="text-[var(--text-default)] hover:text-[var(--text-strong)] transition-colors">
            Categories
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthedView ? (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-[var(--height-button)] px-[var(--padding-button-x)]"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="h-[var(--height-button)] px-[var(--padding-button-x)] bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="h-[var(--height-button)] px-[var(--padding-button-x)]"
              >
                <Link to={dashboardPath}>Dashboard</Link>
              </Button>
              <span className="hidden lg:inline text-sm text-[var(--text-muted)]">
                {user?.name}
              </span>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <Link to="/profile">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6 text-[var(--text-strong)]" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[var(--height-navbar)] left-0 right-0 bg-[var(--bg-surface)] border-b border-[var(--border-soft)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="p-4 flex flex-col gap-4">
            <Link to="/jobs" className="text-[var(--text-default)] hover:text-[var(--text-strong)] transition-colors py-2">
              Find Jobs
            </Link>
            <Link to="/#how-it-works" className="text-[var(--text-default)] hover:text-[var(--text-strong)] transition-colors py-2">
              How It Works
            </Link>
            <Link to="/#categories" className="text-[var(--text-default)] hover:text-[var(--text-strong)] transition-colors py-2">
              Categories
            </Link>
            {!isAuthedView ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-soft)]">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="w-full bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-soft)]">
                <Button asChild variant="outline" className="w-full">
                  <Link to={dashboardPath}>Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile">Profile</Link>
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
