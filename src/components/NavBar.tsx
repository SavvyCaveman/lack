import { Link, useLocation } from "react-router-dom";
import { DollarSign, Briefcase, Award, User, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Home", icon: null },
  { to: "/earn", label: "Earn Now", icon: DollarSign },
  { to: "/gigs", label: "Gig Board", icon: Briefcase },
  { to: "/careers", label: "Careers", icon: Award },
  { to: "/profile", label: "My Profile", icon: User },
];

export function NavBar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center">
              <span className="text-black font-black text-xs">L</span>
            </div>
            <span className="font-black text-white tracking-wider text-sm">
              LACK
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.slice(1).map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-zinc-400 hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-white/10 pt-2">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {Icon && <Icon size={15} />}
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
