import { useLogout } from "~/hooks/useAuth";

export default function OnboardingPage() {
  const logout = useLogout();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-headline-md text-foreground">Onboarding</h1>
      <button
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="text-label-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        {logout.isPending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
