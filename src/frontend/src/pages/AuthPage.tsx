import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Shield,
  Train,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, clear, isLoggingIn, identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Once authenticated and actor is ready, check profile and redirect
  useEffect(() => {
    if (!isAuthenticated || !actor || actorFetching || isRedirecting) return;

    const handlePostLogin = async () => {
      setIsRedirecting(true);
      setAuthError(null);

      try {
        // The actor initialization already called registerOrLogin and cached the profile.
        // Use the cached result if available, otherwise call registerOrLogin again.
        let profile = queryClient.getQueryData<{ fullName: string }>([
          "registerOrLoginProfile",
        ]);

        if (!profile) {
          profile = await actor.registerOrLogin();
          queryClient.setQueryData(["registerOrLoginProfile"], profile);
          queryClient.setQueryData(["currentUserProfile"], profile);
        }

        // If profile is incomplete (no fullName), go to profile setup
        if (!profile.fullName || profile.fullName.trim() === "") {
          navigate({ to: "/profile" });
        } else {
          navigate({ to: "/dashboard" });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Auth error:", msg);
        setAuthError(
          "Failed to initialize your account. Please try logging in again.",
        );
        setIsRedirecting(false);
        // Clear identity so user can retry
        await clear();
        queryClient.clear();
      }
    };

    handlePostLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    actor,
    actorFetching,
    isRedirecting,
    navigate,
    clear,
    queryClient,
  ]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await login();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "User is already authenticated") {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      } else {
        setAuthError("Login failed. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isLoading =
    isLoggingIn || (isAuthenticated && (actorFetching || isRedirecting));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center gap-3 shadow-md">
        <img
          src="/assets/generated/railmutual-logo.dim_256x256.png"
          alt="RailMutual Connect"
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold font-poppins tracking-tight">
            RailMutual Connect
          </h1>
          <p className="text-xs text-primary-foreground/70">
            Indian Railways Mutual Transfer Portal
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-2">
              <Train className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-poppins text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sign in securely to access your mutual transfer dashboard and
              connect with fellow railway employees.
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* Login Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Secure Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uses passkeys, Google, Apple, or Microsoft sign-in
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Railway Employee Network
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connect with employees across all zones and divisions
                  </p>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => navigate({ to: "/dashboard" })}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up your account…
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In Securely
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to use this portal only for legitimate
            mutual transfer requests within Indian Railways.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t border-border">
        <p>
          © {new Date().getFullYear()} RailMutual Connect — Built with{" "}
          <span className="text-destructive">♥</span> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
