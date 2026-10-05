import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppData, Settings } from "@/lib/types";
import { buildSampleData, defaultSettings, emptyData, emptyResume } from "@/lib/sampleData";

const STORAGE_KEY = "studentos.v1";

export interface ImportResult {
  ok: boolean;
  error?: string;
}

interface StoreValue {
  data: AppData;
  ready: boolean;
  update: (fn: (draft: AppData) => AppData) => void;
  setSettings: (patch: Partial<Settings>) => void;
  exportJSON: () => string;
  importJSON: (raw: string) => ImportResult;
  clearAll: () => void;
  loadSample: () => void;
  removeSampleData: () => void;
  hasSampleData: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function migrate(parsed: unknown): AppData {
  const base = emptyData();
  if (!parsed || typeof parsed !== "object") return base;
  const p = parsed as Partial<AppData>;
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    version: 1,
    settings: { ...defaultSettings, ...(p.settings ?? {}) },
    subjects: arr(p.subjects),
    sessions: arr(p.sessions),
    exams: arr(p.exams),
    tasks: arr(p.tasks),
    goals: arr(p.goals),
    transactions: arr(p.transactions),
    snippets: arr(p.snippets),
    recipes: arr(p.recipes),
    workouts: arr(p.workouts),
    workoutLogs: arr(p.workoutLogs),
    focusSessions: arr(p.focusSessions),
    resume: { ...emptyResume, ...(p.resume ?? {}) },
    ...(Array.isArray(p.cvs) ? { cvs: p.cvs } : {}),
    ...(typeof p.activeCvId === "string" ? { activeCvId: p.activeCvId } : {}),
  };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => emptyData());
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  // Load once on the client. SSR renders the empty shell; hydration then fills it.
  useEffect(() => {
    let next: AppData;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      next = raw ? migrate(JSON.parse(raw)) : buildSampleData();
    } catch {
      next = buildSampleData();
    }
    setData(next);
    readyRef.current = true;
    setReady(true);
  }, []);

  // Persist on change (never before the initial load has happened).
  useEffect(() => {
    if (!readyRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable — app keeps working in memory */
    }
  }, [data]);

  // Theme + accent applied to <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("light", data.settings.theme === "light");
    root.classList.toggle("dark", data.settings.theme === "dark");
    root.dataset["accent"] = data.settings.accent;
  }, [data.settings.theme, data.settings.accent]);

  const update = useCallback((fn: (draft: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const exportJSON = useCallback(
    () => JSON.stringify({ app: "StudentOS", exportedAt: new Date().toISOString(), data }, null, 2),
    [data],
  );

  const importJSON = useCallback((raw: string): ImportResult => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ok: false, error: "That file isn't valid JSON." };
    }
    const payload =
      parsed && typeof parsed === "object" && "data" in (parsed as Record<string, unknown>)
        ? (parsed as Record<string, unknown>)["data"]
        : parsed;
    if (!payload || typeof payload !== "object") {
      return { ok: false, error: "The file doesn't contain StudentOS data." };
    }
    const known = ["tasks", "subjects", "sessions", "goals", "transactions", "settings"];
    const hasAny = known.some((k) => k in (payload as Record<string, unknown>));
    if (!hasAny) return { ok: false, error: "The file doesn't look like a StudentOS backup." };
    setData(migrate(payload));
    return { ok: true };
  }, []);

  const clearAll = useCallback(() => setData(emptyData()), []);
  const loadSample = useCallback(
    () =>
      setData((prev) => ({
        ...buildSampleData(),
        settings: prev.settings,
        ...(prev.cvs ? { cvs: prev.cvs } : {}),
        ...(prev.activeCvId ? { activeCvId: prev.activeCvId } : {}),
      })),
    [],
  );

  const removeSampleData = useCallback(() => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((x) => !x.sample),
      sessions: prev.sessions.filter((x) => !x.sample),
      exams: prev.exams.filter((x) => !x.sample),
      tasks: prev.tasks.filter((x) => !x.sample),
      goals: prev.goals.filter((x) => !x.sample),
      transactions: prev.transactions.filter((x) => !x.sample),
      snippets: prev.snippets.filter((x) => !x.sample),
      recipes: prev.recipes.filter((x) => !x.sample),
      workouts: prev.workouts.filter((x) => !x.sample),
      workoutLogs: [],
      focusSessions: [],
    }));
  }, []);

  const hasSampleData = useMemo(
    () =>
      [
        data.subjects,
        data.sessions,
        data.exams,
        data.tasks,
        data.goals,
        data.transactions,
        data.snippets,
        data.recipes,
        data.workouts,
      ].some((list) => (list as { sample?: boolean }[]).some((x) => x.sample)),
    [data],
  );

  const value = useMemo<StoreValue>(
    () => ({
      data,
      ready,
      update,
      setSettings,
      exportJSON,
      importJSON,
      clearAll,
      loadSample,
      removeSampleData,
      hasSampleData,
    }),
    [
      data,
      ready,
      update,
      setSettings,
      exportJSON,
      importJSON,
      clearAll,
      loadSample,
      removeSampleData,
      hasSampleData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}

export function useSettings() {
  return useStore().data.settings;
}
