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
  DashboardAgentPage,
  DashboardMapFocus,
  DashboardProfile,
  DashboardSession,
  PageAgentState,
  UserFinancialProfile,
  LifestyleSnapshot,
  PositionalityProfile,
  IdentityProfile,
  LivingHistory,
  LivingHistoryNode,
  ProfileChatState,
  ProfileChatMessage,
  MovePlanState,
  MovePlanMessage,
  DocumentSection,
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

const DEFAULT_IDENTITY: IdentityProfile = {
  ethnicity: "",
  communityTies: "",
};

const DEFAULT_PROFILE: DashboardProfile = {
  financial: DEFAULT_FINANCIAL,
  lifestyle: DEFAULT_LIFESTYLE,
  positionality: DEFAULT_POSITIONALITY,
  identity: DEFAULT_IDENTITY,
};

const DEFAULT_MOVE_PLAN: MovePlanState = {
  messages: [],
  answers: {},
  complete: false,
  documentSections: [],
};

const DEFAULT_PAGE_AGENTS: Record<DashboardAgentPage, PageAgentState> = {
  neighborhoods: { messages: [] },
  "conscious-move": { messages: [] },
  resources: { messages: [] },
};

const MOVE_PLAN_VERSION = 3;

interface StoredDashboardState {
  citySlug: string;
  chatCitySlug?: string;
  profile: DashboardProfile;
  livingHistory?: LivingHistory;
  profileChat?: ProfileChatState;
  movePlan?: MovePlanState;
  pageAgents?: Partial<Record<DashboardAgentPage, PageAgentState>>;
  mapFocus?: DashboardMapFocus | null;
  movePlanVersion?: number;
}

interface DashboardContextValue {
  hydrated: boolean;
  session: DashboardSession | null;
  city: City;
  citySlug: string;
  profile: DashboardProfile;
  livingHistory: LivingHistory;
  profileChat: ProfileChatState;
  summary: CityDashboardSummary | null;
  summaryStatus: "idle" | "loading" | "ready" | "error";
  aiEnhanced: boolean;
  cities: City[];
  setCitySlug: (slug: string) => void;
  updateFinancial: (patch: Partial<UserFinancialProfile>) => void;
  updateLifestyle: (patch: Partial<LifestyleSnapshot>) => void;
  updatePositionality: (patch: Partial<PositionalityProfile>) => void;
  updateIdentity: (patch: Partial<IdentityProfile>) => void;
  addHistoryNode: (node: LivingHistoryNode) => void;
  updateHistoryNode: (id: string, patch: Partial<LivingHistoryNode>) => void;
  removeHistoryNode: (id: string) => void;
  reorderHistoryNodes: (fromIndex: number, toIndex: number) => void;
  setProfileChat: (chat: ProfileChatState) => void;
  addProfileChatMessage: (msg: ProfileChatMessage) => void;
  movePlan: MovePlanState;
  pageAgents: Record<DashboardAgentPage, PageAgentState>;
  mapFocus: DashboardMapFocus | null;
  setMovePlanMessages: (msgs: MovePlanMessage[]) => void;
  addMovePlanMessage: (msg: MovePlanMessage) => void;
  setMovePlanAnswers: (answers: Record<string, unknown>) => void;
  setMovePlanComplete: (complete: boolean) => void;
  setMovePlanDocumentSections: (sections: DocumentSection[]) => void;
  setPageAgentMessages: (
    page: DashboardAgentPage,
    msgs: MovePlanMessage[]
  ) => void;
  addPageAgentMessage: (page: DashboardAgentPage, msg: MovePlanMessage) => void;
  resetPageAgent: (page: DashboardAgentPage) => void;
  setMapFocus: (focus: DashboardMapFocus) => void;
  clearMapFocus: () => void;
  resetMovePlan: () => void;
  resetAllState: () => void;
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
  const [livingHistory, setLivingHistory] = useState<LivingHistory>({ nodes: [] });
  const [profileChat, setProfileChatState] = useState<ProfileChatState>({
    messages: [],
    concerns: [],
  });
  const [movePlan, setMovePlanState] = useState<MovePlanState>(DEFAULT_MOVE_PLAN);
  const [pageAgents, setPageAgents] =
    useState<Record<DashboardAgentPage, PageAgentState>>(DEFAULT_PAGE_AGENTS);
  const [mapFocus, setMapFocusState] = useState<DashboardMapFocus | null>(null);

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
        identity: {
          ...DEFAULT_IDENTITY,
          ...nextState.profile.identity,
        },
      });
    }

    if (nextState?.livingHistory?.nodes?.length) {
      setLivingHistory(nextState.livingHistory);
    }

    const chatCityMatch =
      nextState?.chatCitySlug === nextState?.citySlug;

    if (
      chatCityMatch &&
      nextState?.profileChat?.messages?.length &&
      nextState.movePlanVersion === MOVE_PLAN_VERSION
    ) {
      setProfileChatState(nextState.profileChat);
    }

    if (
      chatCityMatch &&
      nextState?.movePlan &&
      nextState.movePlanVersion === MOVE_PLAN_VERSION
    ) {
      setMovePlanState({ ...DEFAULT_MOVE_PLAN, ...nextState.movePlan });
    }

    if (chatCityMatch && nextState?.pageAgents) {
      setPageAgents({
        neighborhoods: {
          ...DEFAULT_PAGE_AGENTS.neighborhoods,
          ...nextState.pageAgents.neighborhoods,
        },
        "conscious-move": {
          ...DEFAULT_PAGE_AGENTS["conscious-move"],
          ...nextState.pageAgents["conscious-move"],
        },
        resources: {
          ...DEFAULT_PAGE_AGENTS.resources,
          ...nextState.pageAgents.resources,
        },
      });
    }

    if (nextState?.mapFocus) {
      setMapFocusState(nextState.mapFocus);
    }

    setHydrated(true);
  }, [router]);

  useEffect(() => {
    if (!hydrated || !session || typeof window === "undefined") return;

    window.localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        citySlug,
        chatCitySlug: citySlug,
        profile,
        livingHistory,
        profileChat,
        movePlan,
        pageAgents,
        mapFocus,
        movePlanVersion: MOVE_PLAN_VERSION,
      } satisfies StoredDashboardState)
    );
  }, [
    citySlug,
    hydrated,
    livingHistory,
    mapFocus,
    movePlan,
    pageAgents,
    profile,
    profileChat,
    session,
  ]);

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
            livingHistory,
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
  }, [citySlug, hydrated, livingHistory, profile, session]);

  const setCitySlug = useCallback((slug: string) => {
    if (!getCityBySlug(slug)) return;
    setCitySlugState(slug);
    setMapFocusState(null);
    setProfileChatState({ messages: [], concerns: [] });
    setMovePlanState(DEFAULT_MOVE_PLAN);
    setPageAgents(DEFAULT_PAGE_AGENTS);
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

  const updateIdentity = useCallback(
    (patch: Partial<IdentityProfile>) => {
      setProfile((current) => ({
        ...current,
        identity: {
          ...current.identity,
          ...patch,
        },
      }));
    },
    []
  );

  const addHistoryNode = useCallback((node: LivingHistoryNode) => {
    setLivingHistory((prev) => ({ nodes: [...prev.nodes, node] }));
  }, []);

  const updateHistoryNode = useCallback(
    (id: string, patch: Partial<LivingHistoryNode>) => {
      setLivingHistory((prev) => ({
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      }));
    },
    []
  );

  const removeHistoryNode = useCallback((id: string) => {
    setLivingHistory((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== id && n.parentId !== id),
    }));
  }, []);

  const reorderHistoryNodes = useCallback(
    (fromIndex: number, toIndex: number) => {
      setLivingHistory((prev) => {
        const next = [...prev.nodes];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return { nodes: next };
      });
    },
    []
  );

  const setProfileChat = useCallback((chat: ProfileChatState) => {
    setProfileChatState(chat);
  }, []);

  const addProfileChatMessage = useCallback((msg: ProfileChatMessage) => {
    setProfileChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
  }, []);

  const setMovePlanMessages = useCallback((msgs: MovePlanMessage[]) => {
    setMovePlanState((prev) => ({ ...prev, messages: msgs }));
  }, []);

  const addMovePlanMessage = useCallback((msg: MovePlanMessage) => {
    setMovePlanState((prev) => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
  }, []);

  const setMovePlanAnswers = useCallback((answers: Record<string, unknown>) => {
    setMovePlanState((prev) => ({ ...prev, answers }));
  }, []);

  const setMovePlanComplete = useCallback((complete: boolean) => {
    setMovePlanState((prev) => ({ ...prev, complete }));
  }, []);

  const setMovePlanDocumentSections = useCallback((sections: DocumentSection[]) => {
    setMovePlanState((prev) => ({ ...prev, documentSections: sections }));
  }, []);

  const setPageAgentMessages = useCallback(
    (page: DashboardAgentPage, msgs: MovePlanMessage[]) => {
      setPageAgents((prev) => ({
        ...prev,
        [page]: { messages: msgs },
      }));
    },
    []
  );

  const addPageAgentMessage = useCallback(
    (page: DashboardAgentPage, msg: MovePlanMessage) => {
      setPageAgents((prev) => ({
        ...prev,
        [page]: {
          messages: [...prev[page].messages, msg],
        },
      }));
    },
    []
  );

  const resetPageAgent = useCallback((page: DashboardAgentPage) => {
    setPageAgents((prev) => ({
      ...prev,
      [page]: { messages: [] },
    }));
  }, []);

  const setMapFocus = useCallback((focus: DashboardMapFocus) => {
    setMapFocusState(focus);
  }, []);

  const clearMapFocus = useCallback(() => {
    setMapFocusState(null);
  }, []);

  const resetMovePlan = useCallback(() => {
    setMovePlanState(DEFAULT_MOVE_PLAN);
  }, []);

  const resetAllState = useCallback(() => {
    setCitySlugState(DEFAULT_CITY_SLUG);
    setProfile(DEFAULT_PROFILE);
    setLivingHistory({ nodes: [] });
    setProfileChatState({ messages: [], concerns: [] });
    setMovePlanState(DEFAULT_MOVE_PLAN);
    setPageAgents(DEFAULT_PAGE_AGENTS);
    setMapFocusState(null);
    setSummary(null);
    setSummaryStatus("idle");
    setAiEnhanced(false);
  }, []);

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
      livingHistory,
      profileChat,
      summary,
      summaryStatus,
      aiEnhanced,
      cities: CITIES,
      setCitySlug,
      updateFinancial,
      updateLifestyle,
      updatePositionality,
      updateIdentity,
      addHistoryNode,
      updateHistoryNode,
      removeHistoryNode,
      reorderHistoryNodes,
      setProfileChat,
      addProfileChatMessage,
      movePlan,
      pageAgents,
      mapFocus,
      setMovePlanMessages,
      addMovePlanMessage,
      setMovePlanAnswers,
      setMovePlanComplete,
      setMovePlanDocumentSections,
      setPageAgentMessages,
      addPageAgentMessage,
      resetPageAgent,
      setMapFocus,
      clearMapFocus,
      resetMovePlan,
      resetAllState,
      signOut,
    }),
    [
      addHistoryNode,
      addMovePlanMessage,
      addProfileChatMessage,
      aiEnhanced,
      clearMapFocus,
      city,
      citySlug,
      hydrated,
      livingHistory,
      mapFocus,
      movePlan,
      pageAgents,
      profile,
      profileChat,
      reorderHistoryNodes,
      removeHistoryNode,
      resetPageAgent,
      resetAllState,
      resetMovePlan,
      session,
      setMapFocus,
      setPageAgentMessages,
      setCitySlug,
      addPageAgentMessage,
      setMovePlanAnswers,
      setMovePlanComplete,
      setMovePlanDocumentSections,
      setMovePlanMessages,
      setProfileChat,
      signOut,
      summary,
      summaryStatus,
      updateFinancial,
      updateHistoryNode,
      updateIdentity,
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
