"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { CITIES, DEFAULT_CITY_SLUG, getCityBySlug } from "@/lib/cities";
import type {
  City,
  CityDashboardSummary,
  DashboardProfile,
  DashboardSession,
  UserFinancialProfile,
  LifestyleSnapshot,
  PositionalityProfile,
} from "@/lib/types";

const SESSION_KEY = "cyh-dashboard-session";
const STATE_KEY = "cyh-dashboard-state";

const DEFAULT_FINANCIAL: UserFinancialProfile = {
  annualIncome: 78000,
  savings: 12000,
  monthlyDebt: 320,
};

const DEFAULT_LIFESTYLE: LifestyleSnapshot = {
  currentMonthlyCost: 2800,
  spendingHabit: "balanced",
  housingPreference: "roommates",
  workStyle: "hybrid",
};

const DEFAULT_POSITIONALITY: PositionalityProfile = {
  financialBackup: "some",
  languageFluency: "conversational",
  moveReason: "opportunity",
};

const DEFAULT_PROFILE: DashboardProfile = {
  financial: DEFAULT_FINANCIAL,
  lifestyle: DEFAULT_LIFESTYLE,
  positionality: DEFAULT_POSITIONALITY,
};

interface StoredDashboardState {
  citySlug: string;
  profile: DashboardProfile;
}

interface DashboardContextValue {
  hydrated: boolean;
  session: DashboardSession | null;
  city: City;
  citySlug: string;
  profile: DashboardProfile;
  summary: CityDashboardSummary | null;
  summaryStatus: "idle" | "loading" | "ready" | "error";
  aiEnhanced: boolean;
  cities: City[];
  setCitySlug: (slug: string) => void;
  updateFinancial: (patch: Partial<UserFinancialProfile>) => void;
  updateLifestyle: (patch: Partial<LifestyleSnapshot>) => void;
  updatePositionality: (patch: Partial<PositionalityProfile>) => void;
  signOut: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [citySlug, setCitySlugState] = useState(DEFAULT_CITY_SLUG);
  const [profile, setProfile] = useState<DashboardProfile>(DEFAULT_PROFILE);
  const [summary, setSummary] = useState<CityDashboardSummary | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [aiEnhanced, setAiEnhanced] = useState(false);

  useEffect(() => {
    const nextSession = readJson<DashboardSession>(SESSION_KEY);
    const nextState = readJson<StoredDashboardState>(STATE_KEY);

    if (!nextSession) {
      router.replace("/sign-in");
      setHydrated(true);
      return;
    }

    setSession(nextSession);

    if (nextState?.citySlug && getCityBySlug(nextState.citySlug)) {
      setCitySlugState(nextState.citySlug);
    }

    if (nextState?.profile) {
      setProfile({
        financial: { ...DEFAULT_FINANCIAL, ...nextState.profile.financial },
        lifestyle: { ...DEFAULT_LIFESTYLE, ...nextState.profile.lifestyle },
        positionality: {
          ...DEFAULT_POSITIONALITY,
          ...nextState.profile.positionality,
        },
      });
    }

    setHydrated(true);
  }, [router]);

  useEffect(() => {
    if (!hydrated || !session || typeof window === "undefined") return;

    window.localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        citySlug,
        profile,
      } satisfies StoredDashboardState)
    );
  }, [citySlug, hydrated, profile, session]);

  useEffect(() => {
    if (!hydrated || !session) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSummaryStatus("loading");

      try {
        const response = await fetch("/api/dashboard-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            citySlug,
            profile,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Dashboard summary failed");
        }

        const data = (await response.json()) as {
          summary?: CityDashboardSummary;
          aiEnhanced?: boolean;
        };

        setSummary(data.summary ?? null);
        setAiEnhanced(Boolean(data.aiEnhanced));
        setSummaryStatus("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setSummaryStatus("error");
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [citySlug, hydrated, profile, session]);

  const setCitySlug = useCallback((slug: string) => {
    if (!getCityBySlug(slug)) return;
    setCitySlugState(slug);
  }, []);

  const updateFinancial = useCallback((patch: Partial<UserFinancialProfile>) => {
    setProfile((current) => ({
      ...current,
      financial: {
        ...current.financial,
        ...patch,
      },
    }));
  }, []);

  const updateLifestyle = useCallback((patch: Partial<LifestyleSnapshot>) => {
    setProfile((current) => ({
      ...current,
      lifestyle: {
        ...current.lifestyle,
        ...patch,
      },
    }));
  }, []);

  const updatePositionality = useCallback(
    (patch: Partial<PositionalityProfile>) => {
      setProfile((current) => ({
        ...current,
        positionality: {
          ...current.positionality,
          ...patch,
        },
      }));
    },
    []
  );

  const signOut = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    }

    setSession(null);
    router.push("/sign-in");
  }, [router]);

  const city = getCityBySlug(citySlug) ?? CITIES[0];

  const value = useMemo<DashboardContextValue>(
    () => ({
      hydrated,
      session,
      city,
      citySlug,
      profile,
      summary,
      summaryStatus,
      aiEnhanced,
      cities: CITIES,
      setCitySlug,
      updateFinancial,
      updateLifestyle,
      updatePositionality,
      signOut,
    }),
    [
      aiEnhanced,
      city,
      citySlug,
      hydrated,
      profile,
      session,
      setCitySlug,
      signOut,
      summary,
      summaryStatus,
      updateFinancial,
      updateLifestyle,
      updatePositionality,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }

  return context;
}

export function writeDashboardSession(session: DashboardSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
