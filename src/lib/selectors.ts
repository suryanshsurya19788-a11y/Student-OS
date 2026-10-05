import type { AppData, Task } from "./types";
import { addDays, monthKey, todayISO, weekDates } from "./date";

export function taskBuckets(tasks: Task[]) {
  const today = todayISO();
  return {
    today: tasks.filter((t) => !t.completed && t.due === today),
    upcoming: tasks.filter((t) => !t.completed && t.due > today),
    overdue: tasks.filter((t) => !t.completed && t.due && t.due < today),
    completed: tasks.filter((t) => t.completed),
    noDate: tasks.filter((t) => !t.completed && !t.due),
  };
}

export function dashboardStats(data: AppData) {
  const today = todayISO();
  const week = weekDates(today, data.settings.weekStart);

  const tasksToday = data.tasks.filter((t) => t.due === today);
  const tasksDoneToday = data.tasks.filter(
    (t) => t.completed && (t.completedAt === today || t.due === today),
  ).length;

  const focusThisWeek = data.focusSessions
    .filter((s) => week.includes(s.date))
    .reduce((sum, s) => sum + s.minutes, 0);

  const studyThisWeek = data.sessions
    .filter((s) => s.completed && week.includes(s.date))
    .reduce((sum, s) => sum + s.duration, 0);

  const focusToday = data.focusSessions
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + s.minutes, 0);

  // streak: consecutive days back from today with a completed session or focus block
  const activeDays = new Set([
    ...data.focusSessions.map((s) => s.date),
    ...data.sessions.filter((s) => s.completed).map((s) => s.date),
  ]);
  let streak = 0;
  let cursor = today;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const mk = monthKey(today);
  const monthTx = data.transactions.filter((t) => t.date.startsWith(mk));
  const monthSpend = monthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const monthIncome = monthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const balance = data.transactions.reduce(
    (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
    0,
  );

  const goalProgress = data.goals.length
    ? Math.round(data.goals.reduce((s, g) => s + g.progress, 0) / data.goals.length)
    : 0;

  return {
    today,
    week,
    tasksToday,
    tasksDoneToday,
    tasksTodayTotal: tasksToday.length,
    focusThisWeek,
    focusToday,
    studyThisWeek,
    streak,
    monthSpend,
    monthIncome,
    balance,
    goalProgress,
  };
}

export function weeklyFocusBars(data: AppData) {
  const week = weekDates(todayISO(), data.settings.weekStart);
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return week.map((iso) => {
    const minutes = data.focusSessions
      .filter((s) => s.date === iso)
      .reduce((sum, s) => sum + s.minutes, 0);
    const d = new Date(iso + "T00:00:00");
    return {
      label: labels[d.getDay()] as string,
      value: Math.round((minutes / 60) * 10) / 10,
      muted: iso > todayISO(),
    };
  });
}
