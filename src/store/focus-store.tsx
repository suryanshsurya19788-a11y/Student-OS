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
import { useStore } from "./app-store";
import { todayISO } from "@/lib/date";
import { uid } from "@/lib/sampleData";

export type FocusMode = "focus" | "break";

interface FocusValue {
  mode: FocusMode;
  running: boolean;
  remaining: number; // seconds
  total: number; // seconds
  completedToday: number;
  cycle: number;
  linkLabel: string;
  linkTaskId: string;
  linkSubjectId: string;
  setLink: (v: { taskId?: string; subjectId?: string; label?: string }) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  setDurations: (focusMin: number, breakMin: number) => void;
  focusMin: number;
  breakMin: number;
}

const FocusContext = createContext<FocusValue | null>(null);

export function FocusProvider({ children }: { children: ReactNode }) {
  const { data, update } = useStore();
  const [focusMin, setFocusMin] = useState(data.settings.focusMinutes);
  const [breakMin, setBreakMin] = useState(data.settings.breakMinutes);
  const [mode, setMode] = useState<FocusMode>("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(data.settings.focusMinutes * 60);
  const [cycle, setCycle] = useState(1);
  const [linkTaskId, setLinkTaskId] = useState("");
  const [linkSubjectId, setLinkSubjectId] = useState("");
  const [linkLabel, setLinkLabel] = useState("Focus block");
  const touched = useRef(false);

  // Follow settings changes while the timer is idle.
  useEffect(() => {
    setFocusMin(data.settings.focusMinutes);
    setBreakMin(data.settings.breakMinutes);
    if (!running && !touched.current) {
      setRemaining(
        (mode === "focus" ? data.settings.focusMinutes : data.settings.breakMinutes) * 60,
      );
    }
  }, [data.settings.focusMinutes, data.settings.breakMinutes, running, mode]);

  const finish = useCallback(
    (logIt: boolean) => {
      if (mode === "focus") {
        const elapsedMin = Math.round((focusMin * 60 - remaining) / 60);
        if (logIt && elapsedMin > 0) {
          update((d) => ({
            ...d,
            focusSessions: [
              ...d.focusSessions,
              {
                id: uid(),
                date: todayISO(),
                minutes: elapsedMin,
                label: linkLabel || "Focus block",
                ...(linkTaskId ? { taskId: linkTaskId } : {}),
                ...(linkSubjectId ? { subjectId: linkSubjectId } : {}),
              },
            ],
          }));
        }
        setMode("break");
        setRemaining(breakMin * 60);
        setCycle((c) => c + 1);
      } else {
        setMode("focus");
        setRemaining(focusMin * 60);
      }
      touched.current = false;
      setRunning(false);
    },
    [mode, focusMin, breakMin, remaining, update, linkLabel, linkTaskId, linkSubjectId],
  );

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          queueMicrotask(() => finishRef.current(true));
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const completedToday = useMemo(() => {
    const t = todayISO();
    return data.focusSessions.filter((s) => s.date === t).length;
  }, [data.focusSessions]);

  const value = useMemo<FocusValue>(
    () => ({
      mode,
      running,
      remaining,
      total: (mode === "focus" ? focusMin : breakMin) * 60,
      completedToday,
      cycle,
      linkLabel,
      linkTaskId,
      linkSubjectId,
      setLink: (v) => {
        if (v.taskId !== undefined) setLinkTaskId(v.taskId);
        if (v.subjectId !== undefined) setLinkSubjectId(v.subjectId);
        if (v.label !== undefined) setLinkLabel(v.label);
      },
      start: () => {
        touched.current = true;
        setRunning(true);
      },
      pause: () => setRunning(false),
      reset: () => {
        setRunning(false);
        touched.current = false;
        setRemaining((mode === "focus" ? focusMin : breakMin) * 60);
      },
      skip: () => finishRef.current(true),
      setDurations: (f, b) => {
        setFocusMin(f);
        setBreakMin(b);
        setRunning(false);
        touched.current = false;
        setRemaining((mode === "focus" ? f : b) * 60);
      },
      focusMin,
      breakMin,
    }),
    [
      mode,
      running,
      remaining,
      focusMin,
      breakMin,
      completedToday,
      cycle,
      linkLabel,
      linkTaskId,
      linkSubjectId,
    ],
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used inside FocusProvider");
  return ctx;
}
