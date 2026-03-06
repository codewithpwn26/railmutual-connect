import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  Shield,
  Train,
  Users,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LandingPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();

  const handleGetStarted = () => {
    if (identity) {
      router.navigate({ to: "/dashboard" });
    } else {
      router.navigate({ to: "/auth" });
    }
  };

  const features = [
    {
      icon: Users,
      title: "Smart Mutual Matching",
      description:
        "Our algorithm finds employees where your desired location matches their current posting and vice versa.",
    },
    {
      icon: MapPin,
      title: "All India Coverage",
      description:
        "Search across all 17 Railway Zones and hundreds of divisions across the country.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Control your contact visibility. Share details only with employees you choose to connect with.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Your Profile",
      desc: "Enter your current posting, desired location, and designation.",
    },
    {
      step: "02",
      title: "Find Matches",
      desc: "Our system automatically finds employees who match your transfer requirements.",
    },
    {
      step: "03",
      title: "Connect & Coordinate",
      desc: "Reach out to your match and coordinate the mutual transfer process.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary-700 shadow-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/generated/railmutual-logo.dim_256x256.png"
                alt="RailMutual Connect"
                className="h-10 w-10 rounded-lg object-contain bg-white/10 p-1"
              />
              <div>
                <span className="font-display font-bold text-white text-lg leading-tight block">
                  RailMutual
                </span>
                <span className="text-orange-500 text-xs font-medium leading-tight block -mt-0.5">
                  Connect
                </span>
              </div>
            </div>
            <Button
              onClick={handleGetStarted}
              className="bg-orange-500 hover:bg-orange-600 text-white border-0 font-medium"
              size="sm"
            >
              {identity ? "Go to Dashboard" : "Login / Register"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-banner.dim_1440x400.png')",
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            {/* Logo large */}
            <div className="flex items-center gap-4 mb-8">
              <img
                src="/assets/generated/railmutual-logo.dim_256x256.png"
                alt="RailMutual Connect Logo"
                className="h-20 w-20 rounded-2xl object-contain bg-white/15 p-2 shadow-lg"
              />
              <div>
                <h2 className="font-display font-bold text-white text-2xl sm:text-3xl leading-tight">
                  RailMutual Connect
                </h2>
                <p className="text-orange-400 font-medium text-sm mt-0.5">
                  Mutual Transfers Made Easy
                </p>
              </div>
            </div>

            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
              Find Your Perfect{" "}
              <span className="text-orange-400">Mutual Transfer</span> Partner
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
              A dedicated platform for Indian Railways employees to discover
              mutual transfer opportunities. Connect with colleagues who want to
              swap postings — fast, simple, and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white border-0 font-semibold text-base px-8 gap-2"
              >
                {identity ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-white/40 text-white hover:bg-white/10 hover:text-white font-medium text-base"
              >
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "17", label: "Railway Zones" },
              { value: "68+", label: "Divisions" },
              { value: "100%", label: "Free to Use" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display font-bold text-orange-400 text-2xl sm:text-3xl">
                  {value}
                </div>
                <div className="text-white/70 text-xs sm:text-sm mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl mb-3">
              Why Choose RailMutual Connect?
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Built specifically for Indian Railways employees, with features
              designed to make mutual transfers straightforward.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-card-hover transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Three simple steps to find your mutual transfer partner.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-primary-700 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <span className="font-display font-bold text-white text-lg">
                    {step}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-primary-700 hover:bg-primary-800 text-white border-0 font-semibold gap-2"
            >
              Start Finding Matches
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-10 bg-orange-50 border-y border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-orange-600" />
            <h3 className="font-display font-semibold text-foreground text-lg">
              Important Notice
            </h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            RailMutual Connect is an independent platform that{" "}
            <strong>only facilitates connections</strong> between Indian
            Railways employees seeking mutual transfers. This platform does not
            process, approve, or guarantee any official transfer. All official
            transfer procedures are governed by{" "}
            <strong>Indian Railways rules and regulations</strong>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-800 text-white/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/generated/railmutual-logo.dim_256x256.png"
                alt="RailMutual Connect"
                className="h-8 w-8 rounded-lg object-contain bg-white/10 p-1"
              />
              <div>
                <span className="font-display font-bold text-white text-sm">
                  RailMutual Connect
                </span>
                <span className="text-orange-400 text-xs block -mt-0.5">
                  Mutual Transfers Made Easy
                </span>
              </div>
            </div>
            <div className="text-center sm:text-right text-xs">
              <p>
                This platform only facilitates connections between employees.
              </p>
              <p>
                Official transfers are governed by Indian Railways rules and
                regulations.
              </p>
              <p className="mt-2">
                © {new Date().getFullYear()} · Built with{" "}
                <Heart className="inline w-3 h-3 text-orange-400" /> using{" "}
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
