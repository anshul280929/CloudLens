import { signIn } from "@/lib/auth";
import { Cloud, Github, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo to-cyan flex items-center justify-center">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Cloudlens</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 glow-indigo">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in with GitHub to scan your repos and detect services.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-gradient-to-r from-indigo to-indigo-light hover:from-indigo-light hover:to-indigo text-white font-medium shadow-lg shadow-indigo/25 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Permissions info */}
          <div className="mt-6 p-4 rounded-xl bg-background/50 border border-border/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-light shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground/80 mb-1">
                  Permissions we request
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Read access to your repos (code & metadata)</li>
                  <li>• Read your GitHub profile & email</li>
                  <li className="text-indigo-light">
                    ✓ We never write to or modify your code
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in you agree to our{" "}
          <a href="#" className="text-indigo-light hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-light hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
