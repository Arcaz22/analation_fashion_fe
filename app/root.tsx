import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from "react";

import { AppProviders } from "~/providers/AppProviders";
import { authApi } from "~/api/auth";
import { profileApi } from "~/api/profile";
import { useAuthStore } from "~/stores/authStore";
import type { Route } from "./+types/root";
import "./app.css";

export const meta: Route.MetaFunction = () => [
  { title: "MATCH" },
  {
    name: "description",
    content: "Kelola koleksi dan rekomendasi gaya pribadi",
  },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function SilentRefresh() {
  const { clearAuth, setAccessToken, setAuth, setInitialized } = useAuthStore();

  useEffect(() => {
    async function init() {
      const hasSession = window.localStorage.getItem("wardrobe:has-session");

      if (!hasSession) {
        setInitialized();
        return;
      }

      try {
        const refreshResponse = await authApi.refreshToken();
        const newToken = refreshResponse.data.access_token;

        setAccessToken(newToken);
        const meResponse = await authApi.me();
        const user = meResponse.data;
        const profileResponse = await profileApi.me();
        const profile = profileResponse.data;
        const profileCompleted =
          profile.profile_completed ||
          Boolean(profile.skin_tone && profile.body_shape);

        setAuth({ ...user, profile_completed: profileCompleted }, newToken);
        window.localStorage.setItem("wardrobe:has-session", "true");
      } catch {
        clearAuth();
        window.localStorage.removeItem("wardrobe:has-session");
        // Empty by design: anonymous users should continue without auth state.
      } finally {
        setInitialized();
      }
    }

    init();
  }, [clearAuth, setAccessToken, setAuth, setInitialized]);

  return null;
}

function InitializingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-gray-500 uppercase tracking-widest animate-pulse">
        MATCH
      </p>
    </div>
  );
}

export default function Root() {
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return (
    <AppProviders>
      <SilentRefresh />
      {!isInitialized ? <InitializingScreen /> : <Outlet />}
    </AppProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
