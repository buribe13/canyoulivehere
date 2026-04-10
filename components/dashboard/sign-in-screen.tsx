"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MapShell from "@/components/map/map-shell";
import { writeDashboardSession } from "@/components/dashboard/dashboard-provider";

const SESSION_KEY = "cyh-dashboard-session";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("hello@example.com");
  const [password, setPassword] = useState("password");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(SESSION_KEY)) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    writeDashboardSession({
      email,
      signedInAt: new Date().toISOString(),
    });

    router.push("/dashboard");
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-bg">
      <div className="absolute inset-0 z-0">
        <MapShell citySlug={null} />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="w-full max-w-[400px] rounded-xl bg-bg-raised p-6 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <p className="text-nav text-ink">Can You Live Here?</p>
          <p className="text-caption text-ink-muted mt-0.5">Know before you go.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-9 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 text-body text-ink outline-none focus:border-[rgba(255,255,255,0.2)]"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-9 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 text-body text-ink outline-none focus:border-[rgba(255,255,255,0.2)]"
              />
            </label>

            <button
              type="submit"
              className="mt-1 flex h-9 w-full items-center justify-center rounded-lg bg-white px-4 text-body text-black transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
