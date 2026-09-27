import { useEffect, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { Link, NavLink } from "react-router";

import { useLogout } from "~/hooks/useAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const logout = useLogout();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1c1b1b]">
      <header className="sticky top-0 z-40 border-b border-[#E8E8E4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:h-20 md:px-10">
          <Link
            className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1c1b1b]"
            to="/catalog"
          >
            MATCH
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <ShellNavLink to="/catalog">Koleksi</ShellNavLink>
            <ShellNavLink to="/recommendations">Rekomendasi</ShellNavLink>
          </nav>

          <div className="flex items-center gap-5">
            {/* <button
              className="relative hidden text-[#747878] transition-colors hover:text-[#1c1b1b] md:block"
              type="button"
              aria-label="Koleksi pilihan"
            >
              <FiShoppingBag className="size-5" aria-hidden="true" />
              <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#1c1b1b] text-[9px] font-bold text-white">
                2
              </span>
            </button> */}
            <div ref={profileMenuRef} className="relative">
              <button
                className="grid size-10 place-items-center border border-[#E8E8E4] bg-white text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
                type="button"
                aria-label="Buka menu profile"
                aria-controls="profile-menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <FiUser className="size-5" aria-hidden="true" />
              </button>

              {profileMenuOpen ? (
                <div
                  id="profile-menu"
                  className="absolute right-0 top-12 w-44 border border-[#E8E8E4] bg-white p-1 shadow-lg"
                >
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

        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#E8E8E4] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(28,27,27,0.06)] backdrop-blur md:hidden">
          <ShellNavLink mobile to="/catalog">
            Koleksi
          </ShellNavLink>
          <ShellNavLink mobile to="/recommendations">
            Rekomendasi
          </ShellNavLink>
          <ShellNavLink mobile to="/profile">
            Profile
          </ShellNavLink>
        </nav>
      </header>

      <div className="pb-20 md:pb-0">{children}</div>
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
          isActive
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
