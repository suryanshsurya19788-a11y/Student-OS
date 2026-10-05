import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Play, Pause, RotateCcw, SkipForward, Timer as TimerIcon } from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Panel,
  PanelHeading,
  Ring,
  Select,
} from "@/components/ui-kit";
import { BarChart } from "@/components/ui-kit/Charts";
import { useStore } from "@/store/app-store";
import { useFocus } from "@/store/focus-store";
import { weeklyFocusBars } from "@/lib/selectors";
import { minutesToHM, mmss, todayISO } from "@/lib/date";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Timer — StudentOS" },
      {
        name: "description",
        content: "A Pomodoro timer that keeps running while you move around the app.",
      },
      { property: "og:title", content: "Focus Timer — StudentOS" },
      {
        property: "og:description",
        content: "Pomodoro focus and break cycles with a local session history.",
      },
    ],
  }),
  component: FocusPage,
});

const PRESETS = [
  { focus: 25, brk: 5, label: "Classic 25/5" },
  { focus: 50, brk: 10, label: "Deep 50/10" },
  { focus: 15, brk: 3, label: "Short 15/3" },
  { focus: 90, brk: 20, label: "Ultradian 90/20" },
];

function FocusPage() {
  const { data, update } = useStore();
  const focus = useFocus();
  const today = todayISO();
  const bars = useMemo(() => weeklyFocusBars(data), [data]);

  const todaySessions = data.focusSessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((a, s) => a + s.minutes, 0);
  const history = [...data.focusSessions].reverse().slice(0, 12);
  const pct = ((focus.total - focus.remaining) / Math.max(1, focus.total)) * 100;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Focus timer"
        title={focus.mode === "focus" ? "Deep work, one block at a time" : "Break time — step away"}
        description="The timer keeps running while you use other pages."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel accent delay={60} className="flex flex-col items-center py-10">
          <Badge tone={focus.mode === "focus" ? "primary" : "accent2"}>
            {focus.mode === "focus" ? `Focus · cycle ${focus.cycle}` : "Break"}
          </Badge>
          <div className="relative mt-6">
            <Ring
              value={pct}
              size={248}
              stroke={6}
              color={focus.mode === "focus" ? "var(--primary)" : "var(--accent2)"}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-display text-6xl font-semibold tabular-nums leading-none">
                  {mmss(focus.remaining)}
                </p>
                <p className="mt-2 text-xs text-mute">
                  {focus.running ? "Running" : "Paused"} · {focus.linkLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button
              variant={focus.mode === "focus" ? "primary" : "accent2"}
              onClick={focus.running ? focus.pause : focus.start}
            >
              {focus.running ? <Pause className="size-4" /> : <Play className="size-4" />}
              {focus.running ? "Pause" : "Start"}
            </Button>
            <Button onClick={focus.reset}>
              <RotateCcw className="size-4" /> Reset
            </Button>
            <Button onClick={focus.skip}>
              <SkipForward className="size-4" /> Skip
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => focus.setDurations(p.focus, p.brk)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                  focus.focusMin === p.focus && focus.breakMin === p.brk
                    ? "bg-primary/15 text-primary ring-primary/30"
                    : "text-mute ring-line hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel delay={100}>
            <PanelHeading title="This block" />
            <div className="mt-4 space-y-4">
              <Field label="Label">
                <Input
                  value={focus.linkLabel}
                  maxLength={60}
                  onChange={(e) => focus.setLink({ label: e.target.value })}
                  placeholder="What are you working on?"
                />
              </Field>
              <Field label="Link a subject">
                <Select
                  value={focus.linkSubjectId}
                  onChange={(e) => focus.setLink({ subjectId: e.target.value })}
                >
                  <option value="">None</option>
                  {data.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Link a task">
                <Select
                  value={focus.linkTaskId}
                  onChange={(e) => focus.setLink({ taskId: e.target.value })}
                >
                  <option value="">None</option>
                  {data.tasks
                    .filter((t) => !t.completed)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </Select>
              </Field>
            </div>
          </Panel>

          <Panel delay={140}>
            <PanelHeading title="Today" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl veil p-3 ring-1 ring-line">
                <p className="text-[11px] uppercase tracking-[0.14em] text-mute">Blocks</p>
                <p className="mt-1 font-display text-2xl font-semibold">{todaySessions.length}</p>
              </div>
              <div className="rounded-xl veil p-3 ring-1 ring-line">
                <p className="text-[11px] uppercase tracking-[0.14em] text-mute">Focused</p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {minutesToHM(todayMinutes)}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel delay={180}>
          <PanelHeading title="Focus hours" hint="This week" />
          <div className="mt-4">
            <BarChart bars={bars} unit="h" />
          </div>
        </Panel>

        <Panel delay={220}>
          <PanelHeading
            title="Recent blocks"
            action={
              data.focusSessions.length ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => update((d) => ({ ...d, focusSessions: [] }))}
                >
                  Clear history
                </Button>
              ) : undefined
            }
          />
          {history.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<TimerIcon className="size-5" />}
                title="No focus blocks yet"
                description="Finish a block and it lands here."
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {history.map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{s.label}</p>
                    <p className="text-[11px] text-mute">{s.date}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">
                    {s.minutes}m
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
