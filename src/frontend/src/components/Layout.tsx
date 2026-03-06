import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Train,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { ADMIN_EMAIL } from "../config/adminConfig";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: userProfile } = useGetCallerUserProfile();

  // Only show Admin Panel button if the logged-in user's email matches the designated admin email
  const isAdmin =
    !!userProfile?.email &&
    userProfile.email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: "/" });
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/matches", label: "Matches", icon: Users },
    { to: "/profile", label: "My Profile", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-primary-700 shadow-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/assets/generated/railmutual-logo.dim_256x256.png"
                alt="RailMutual Connect"
                className="h-10 w-10 rounded-lg object-contain bg-white/10 p-1"
              />
              <div className="hidden sm:block">
                <span className="font-display font-bold text-white text-lg leading-tight block">
                  RailMutual
                </span>
                <span className="text-orange-500 text-xs font-medium leading-tight block -mt-0.5">
                  Connect
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  activeProps={{
                    className:
                      "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white bg-white/15 border border-white/20",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}

              {/* Admin Panel link — only visible to the designated admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-white/10 transition-colors"
                  activeProps={{
                    className:
                      "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-orange-300 bg-white/15 border border-white/20",
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-primary-800 border-t border-white/10">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  activeProps={{
                    className:
                      "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-white bg-white/15",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}

              {/* Admin Panel link — only visible to the designated admin (mobile) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-white/10 transition-colors"
                  activeProps={{
                    className:
                      "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-orange-300 bg-white/15",
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-primary-800 text-white/60 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Train className="w-3.5 h-3.5 text-orange-500" />
              <span>RailMutual Connect — Mutual Transfers Made Easy</span>
            </div>
            <div className="text-center sm:text-right">
              <p>
                This platform only facilitates connections. Official transfers
                are governed by Indian Railways rules.
              </p>
              <p className="mt-1">
                © {new Date().getFullYear()} · Built with{" "}
                <span className="text-orange-400">♥</span> using{" "}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "railmutual-connect")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
