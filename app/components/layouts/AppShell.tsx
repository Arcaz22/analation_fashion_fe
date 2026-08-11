import { useState } from "react";
import { Link, NavLink } from "react-router";

import { useLogout } from "~/hooks/useAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const logout = useLogout();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1c1b1b]">
      <header className="sticky top-0 z-40 border-b border-[#E8E8E4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:h-20 md:px-10">
          <Link
            className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1c1b1b]"
            to="/catalog"
          >
            WARDROBE
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <ShellNavLink to="/catalog">Koleksi</ShellNavLink>
            <ShellNavLink to="/recommendations">Rekomendasi</ShellNavLink>
            <ShellNavLink to="/archive">Arsip</ShellNavLink>
          </nav>

          <div className="flex items-center gap-5">
            <button
              className="relative hidden text-[#747878] transition-colors hover:text-[#1c1b1b] md:block"
              type="button"
              aria-label="Koleksi pilihan"
            >
              <span className="text-xl">Bag</span>
              <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#1c1b1b] text-[9px] font-bold text-white">
                2
              </span>
            </button>
            <div className="relative">
              <button
                className="grid size-10 place-items-center border border-[#E8E8E4] bg-white text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
                type="button"
                aria-label="Buka menu profile"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ○
                </span>
              </button>

              {profileMenuOpen ? (
                <div className="absolute right-0 top-12 w-44 border border-[#E8E8E4] bg-white p-1 shadow-lg">
                  <Link
                    className="block px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:bg-[#FAFAF8] hover:text-[#1c1b1b]"
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:bg-[#FAFAF8] hover:text-[#ba1a1a] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={logout.isPending}
                    type="button"
                    onClick={() => logout.mutate()}
                  >
                    {logout.isPending ? "Keluar..." : "Logout"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="grid grid-cols-3 border-t border-[#E8E8E4] md:hidden">
          <ShellNavLink mobile to="/catalog">
            Koleksi
          </ShellNavLink>
          <ShellNavLink mobile to="/recommendations">
            Rekomendasi
          </ShellNavLink>
          <ShellNavLink mobile to="/archive">
            Arsip
          </ShellNavLink>
        </nav>
      </header>

      {children}
    </div>
  );
}

function ShellNavLink({
  children,
  mobile = false,
  to,
}: {
  children: React.ReactNode;
  mobile?: boolean;
  to: string;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        `${
          mobile
            ? "py-3 text-center text-[11px]"
            : "border-b-2 py-1 text-[11px]"
        } font-semibold uppercase tracking-[0.14em] transition-colors ${
          isActive && to === "/catalog"
            ? "border-[#1c1b1b] text-[#1c1b1b]"
            : "border-transparent text-[#747878] hover:text-[#1c1b1b]"
        }`
      }
      to={to}
    >
      {children}
    </NavLink>
  );
}
