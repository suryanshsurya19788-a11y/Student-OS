import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Plus,
  Target,
  Wallet,
  Timer,
  ArrowUpRight,
  CalendarClock,
} from "lucide-react";
import { Panel, PanelHeading, Badge, ProgressBar, Ring, EmptyState, Button } from "@/components/ui-kit";
import { BarChart, StackedBar } from "@/components/ui-kit/Charts";
import { useStore } from "@/store/app-store";
import { useFocus } from "@/store/focus-store";
import { dashboardStats, weeklyFocusBars } from "@/lib/selectors";
import {
  formatLongDate,
  formatTime,
  greeting,
  minutesToHM,
  mmss,
  relativeDue,
  todayISO,
} from "@/lib/date";
import { EXPENSE_CATEGORIES, SUBJECT_COLORS } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudentOS" },
      {
        name: "description",
        content:
          "Your day at a glance: today's study schedule, tasks, focus time, goals and spending.",
      },
      { property: "og:title", content: "Dashboard — StudentOS" },
      {
        property: "og:description",
        content: "Today's study schedule, tasks, focus time, goals and spending in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, ready } = useStore();
  const focus = useFocus();
  const navigate = useNavigate();
  const stats = useMemo(() => dashboardStats(data), [data]);
  const bars = useMemo(() => weeklyFocusBars(data), [data]);
  const today = todayISO();
  const cur = data.settings.currency;

  const todaySessions = useMemo(
    () =>
      data.sessions
        .filter((s) => s.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data.sessions, today],
  );

  const upcoming = useMemo(() => {
    const items = [
      ...data.exams
        .filter((e) => e.date >= today)
        .map((e) => ({ id: e.id, title: e.title, date: e.date, kind: "Exam" as const })),
      ...data.tasks
        .filter((t) => !t.completed && t.due >= today && t.category === "Assignment")
        .map((t) => ({ id: t.id, title: t.title, date: t.due, kind: "Assignment" as const })),
    ];
    return items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  }, [data.exams, data.tasks, today]);

  const subjectName = (id: string) => data.subjects.find((s) => s.id === id)?.name ?? "General";
  const subjectColor = (id: string) =>
    data.subjects.find((s) => s.id === id)?.color ?? (SUBJECT_COLORS[0] as string);

  const catSlices = EXPENSE_CATEGORIES.map((c, i) => ({
    label: c,
    value: data.transactions
      .filter((t) => t.type === "expense" && t.category === c && t.date.startsWith(today.slice(0, 7)))
      .reduce((s, t) => s + t.amount, 0),
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] as string,
  })).filter((s) => s.value > 0);

  const donePct = stats.tasksTodayTotal
    ? (stats.tasksDoneToday / Math.max(stats.tasksTodayTotal, stats.tasksDoneToday)) * 100
    : 0;

  if (!ready) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl veil" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl veil" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl veil" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="rise grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {formatLongDate(today)}
          </p>
          <h1 className="mt-1 max-w-[34ch] text-balance font-display text-2xl font-semibold leading-tight sm:text-4xl">
            {greeting()}, {data.settings.displayName || "student"}.{" "}
            {stats.tasksTodayTotal > 0
              ? `${stats.tasksDoneToday} of ${stats.tasksTodayTotal} tasks done today.`
              : "Nothing due today — plan something good."}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button onClick={() => navigate({ to: "/focus" })}>Start focus</Button>
          <Button variant="primary" onClick={() => navigate({ to: "/tasks" })}>
            <Plus className="size-4" /> New task
          </Button>
        </div>
      </header>

      {/* stat row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          to="/tasks"
          delay={50}
          label="Tasks done"
          value={`${stats.tasksDoneToday}`}
          suffix={`/${Math.max(stats.tasksTodayTotal, stats.tasksDoneToday)}`}
        >
          <ProgressBar value={donePct} className="mt-3" />
        </StatCard>

        <StatCard
          to="/planner"
          delay={100}
          label="Study this week"
          value={`${Math.round((stats.studyThisWeek / 60) * 10) / 10}`}
          suffix="h"
        >
          <p className="mt-3 text-[11px] font-medium text-primary">
            {minutesToHM(stats.focusThisWeek)} focused
          </p>
        </StatCard>

        <StatCard to="/focus" delay={150} label="Streak" value={`${stats.streak}`} suffix=" days">
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="size-1.5 rounded-full"
                style={{
                  background: i < Math.min(stats.streak, 6) ? "var(--primary)" : "var(--line)",
                }}
              />
            ))}
          </div>
        </StatCard>

        <StatCard
          to="/expenses"
          delay={200}
          label="Monthly spend"
          value={`${cur}${stats.monthSpend.toFixed(0)}`}
        >
          <p className="mt-3 text-[11px] font-medium text-mute">
            Budget {cur}
            {data.settings.monthlyBudget} ·{" "}
            {Math.round((stats.monthSpend / Math.max(1, data.settings.monthlyBudget)) * 100)}%
          </p>
        </StatCard>

        <Link
          to="/goals"
          className="panel-accent rise col-span-2 p-4 transition-transform hover:-translate-y-0.5 sm:col-span-1"
          style={{ animationDelay: "250ms" }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">
              Goal progress
            </p>
            <Ring value={stats.goalProgress} size={36} stroke={8} />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold leading-none">
            {stats.goalProgress}%
          </p>
          <p className="mt-3 text-[11px] font-medium text-mute">
            {data.goals.length} active {data.goals.length === 1 ? "goal" : "goals"}
          </p>
        </Link>
      </section>

      {/* schedule + rail */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" delay={300}>
          <PanelHeading
            title="Today's schedule"
            action={<Badge>{todaySessions.length} sessions</Badge>}
          />
          {todaySessions.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<CalendarClock className="size-5" />}
                title="No study sessions today"
                description="Block out some time in the planner and it will show up here."
                action={
                  <Link to="/planner">
                    <Button variant="primary" size="sm">
                      Open planner
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <ol className="mt-4 space-y-1">
              {todaySessions.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center gap-3 rounded-xl p-3 ring-1 ${
                    s.completed ? "bg-primary/10 ring-primary/25" : "ring-line"
                  }`}
                >
                  <span className="w-12 shrink-0 font-display text-[13px] font-semibold text-mute">
                    {s.startTime}
                  </span>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: subjectColor(s.subjectId) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{s.title}</p>
                    <p className="truncate text-[11px] text-mute">
                      {subjectName(s.subjectId)} · {s.duration} min
                      {s.location ? ` · ${s.location}` : ""}
                    </p>
                  </div>
                  <Badge tone={s.completed ? "primary" : s.priority === "high" ? "accent2" : "neutral"}>
                    {s.completed ? "Done" : s.priority}
                  </Badge>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel accent delay={350}>
            <PanelHeading
              title="Focus"
              action={
                <span className="text-[10px] font-semibold uppercase tracking-wide text-accent2">
                  {focus.mode === "focus" ? "Pomodoro" : "Break"}
                </span>
              }
            />
            <div className="mt-4 flex items-center gap-4">
              <Ring
                value={((focus.total - focus.remaining) / Math.max(1, focus.total)) * 100}
                size={64}
                color="var(--accent2)"
              />
              <div className="min-w-0">
                <p className="font-display text-3xl font-semibold leading-none tabular-nums">
                  {mmss(focus.remaining)}
                </p>
                <p className="mt-1 truncate text-[11px] text-mute">
                  {focus.completedToday} completed today
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="accent2"
                className="flex-1"
                onClick={focus.running ? focus.pause : focus.start}
              >
                {focus.running ? "Pause" : "Start"}
              </Button>
              <Link to="/focus">
                <Button>Open</Button>
              </Link>
            </div>
          </Panel>

          <Panel delay={400}>
            <PanelHeading title="Quick actions" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <QuickAction to="/tasks" icon={<Plus className="size-3.5" />} label="Add task" />
              <QuickAction to="/goals" icon={<Target className="size-3.5" />} label="New goal" />
              <QuickAction to="/expenses" icon={<Wallet className="size-3.5" />} label="Log expense" />
              <QuickAction to="/focus" icon={<Timer className="size-3.5" />} label="Start focus" />
            </div>
          </Panel>
        </div>
      </section>

      {/* tasks today */}
      <Panel delay={450}>
        <PanelHeading
          title="Today's tasks"
          action={
            <Link to="/tasks" className="text-[11px] font-semibold text-primary hover:underline">
              View all
            </Link>
          }
        />
        {stats.tasksToday.length === 0 ? (
          <p className="mt-3 text-sm text-mute">Nothing left for today. Nice.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {stats.tasksToday.slice(0, 8).map((t) => (
              <Link
                key={t.id}
                to="/tasks"
                className="flex items-center gap-2.5 rounded-xl veil-soft p-3 ring-1 ring-line transition-colors hover:ring-primary/40"
              >
                <span className="size-4 shrink-0 rounded-md ring-1 ring-line" />
                <span className="truncate text-[13px] font-medium">{t.title}</span>
              </Link>
            ))}
          </div>
        )}
      </Panel>

      {/* bottom row */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel delay={500}>
          <PanelHeading title="Focus time" hint="This week" />
          <div className="mt-4">
            <BarChart bars={bars} unit="h" />
          </div>
          <p className="mt-3 text-[11px] text-mute">
            {minutesToHM(stats.focusThisWeek)} total · {minutesToHM(stats.focusToday)} today
          </p>
        </Panel>

        <Panel delay={550}>
          <PanelHeading
            title="Current goals"
            action={
              <Link to="/goals" className="text-[11px] font-semibold text-primary hover:underline">
                Manage
              </Link>
            }
          />
          {data.goals.length === 0 ? (
            <p className="mt-3 text-sm text-mute">No goals yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {data.goals.slice(0, 3).map((g) => (
                <div key={g.id}>
                  <div className="mb-1.5 grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-xs">
                    <span className="truncate font-medium">{g.title}</span>
                    <span className="shrink-0 tabular-nums text-mute">{g.progress}%</span>
                  </div>
                  <ProgressBar value={g.progress} />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel delay={600}>
          <PanelHeading title="Expense summary" hint="This month" />
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-display text-3xl font-semibold">
              {cur}
              {stats.monthSpend.toFixed(0)}
            </p>
            <p className="text-xs text-mute">
              spent · {cur}
              {stats.balance.toFixed(0)} balance
            </p>
          </div>
          <div className="mt-4">
            <StackedBar slices={catSlices} />
          </div>
          <div className="mt-4 space-y-2 text-xs">
            {catSlices.slice(0, 4).map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-sm" style={{ background: s.color }} />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <span className="shrink-0 tabular-nums text-mute">
                  {cur}
                  {s.value.toFixed(0)}
                </span>
              </div>
            ))}
            {catSlices.length === 0 ? (
              <p className="text-mute">No spending logged this month.</p>
            ) : null}
          </div>
        </Panel>
      </section>

      <Panel delay={650}>
        <PanelHeading
          title="Upcoming assignments & exams"
          action={
            <Link to="/planner" className="text-[11px] font-semibold text-primary hover:underline">
              Planner
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-mute">Nothing scheduled ahead.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {upcoming.map((u) => (
              <li key={u.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{u.title}</p>
                  <p className="text-[11px] text-mute">{relativeDue(u.date)}</p>
                </div>
                <Badge tone={u.kind === "Exam" ? "accent2" : "neutral"}>{u.kind}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="pt-2 text-center text-[11px] text-mute">
        StudentOS · All data stays on this device
      </p>
    </div>
  );
}

function StatCard({
  to,
  label,
  value,
  suffix,
  children,
  delay,
}: {
  to: string;
  label: string;
  value: string;
  suffix?: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <Link
      to={to}
      className="panel rise group p-4 transition-transform hover:-translate-y-0.5"
      style={{ animationDelay: `${delay ?? 0}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">{label}</p>
        <ArrowUpRight className="size-3.5 shrink-0 text-mute opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-2 font-display text-3xl font-semibold leading-none tabular-nums">
        {value}
        {suffix ? <span className="text-lg text-mute">{suffix}</span> : null}
      </p>
      {children}
    </Link>
  );
}

function QuickAction({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-lg veil p-3 text-[12px] font-medium ring-1 ring-line transition-colors hover:ring-primary/40"
    >
      <span className="text-primary">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
