import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Dumbbell, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Panel,
  PanelHeading,
  ProgressBar,
  SampleFlag,
  Select,
  Tabs,
} from "@/components/ui-kit";
import { Modal, ConfirmDialog } from "@/components/ui-kit/Modal";
import { useStore } from "@/store/app-store";
import { uid } from "@/lib/sampleData";
import { formatDate, todayISO } from "@/lib/date";
import { EXERCISES, WORKOUT_CATEGORIES, exerciseById } from "@/lib/exercises";
import type { PlanExercise, WorkoutPlan } from "@/lib/types";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workout Planner — StudentOS" },
      {
        name: "description",
        content: "Build workout routines from a built-in exercise library and log your sessions.",
      },
      { property: "og:title", content: "Workout Planner — StudentOS" },
      {
        property: "og:description",
        content: "Routines from a built-in exercise library, plus a local training log.",
      },
    ],
  }),
  component: WorkoutsPage,
});

function WorkoutsPage() {
  const { data, update } = useStore();
  const [tab, setTab] = useState<"plans" | "library" | "history">("plans");

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workout planner"
        title="Move, so the studying sticks"
        description="Build routines from a built-in exercise library — no accounts, no trackers."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "plans", label: "My routines", count: data.workouts.length },
          { value: "library", label: "Exercise library", count: EXERCISES.length },
          { value: "history", label: "History", count: data.workoutLogs.length },
        ]}
        className="max-w-xl"
      />
      {tab === "plans" ? <Plans /> : tab === "library" ? <Library /> : <History />}
    </div>
  );

  function Plans() {
    const [open, setOpen] = useState(false);
    const [toDelete, setToDelete] = useState<WorkoutPlan | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [name, setName] = useState("");
    const [category, setCategory] = useState(WORKOUT_CATEGORIES[0] as string);
    const [duration, setDuration] = useState("40");
    const [picked, setPicked] = useState<string[]>([]);

    function create() {
      const e: Record<string, string> = {};
      if (!name.trim()) e["name"] = "Name the routine.";
      if (picked.length === 0) e["picked"] = "Pick at least one exercise.";
      setErrors(e);
      if (Object.keys(e).length) return;

      const exercises: PlanExercise[] = picked.map((id) => ({
        id: uid(),
        exerciseId: id,
        sets: 3,
        reps: 10,
        done: false,
      }));
      update((d) => ({
        ...d,
        workouts: [
          {
            id: uid(),
            name: name.trim(),
            category,
            durationMin: Number(duration) || 30,
            exercises,
          },
          ...d.workouts,
        ],
      }));
      toast.success("Routine created");
      setOpen(false);
      setName("");
      setPicked([]);
    }

    function toggleExercise(planId: string, exId: string) {
      update((d) => ({
        ...d,
        workouts: d.workouts.map((w) =>
          w.id === planId
            ? {
                ...w,
                exercises: w.exercises.map((x) => (x.id === exId ? { ...x, done: !x.done } : x)),
              }
            : w,
        ),
      }));
    }

    function finish(plan: WorkoutPlan) {
      update((d) => ({
        ...d,
        workoutLogs: [
          {
            id: uid(),
            planId: plan.id,
            planName: plan.name,
            date: todayISO(),
            durationMin: plan.durationMin,
            exercisesDone: plan.exercises.filter((x) => x.done).length || plan.exercises.length,
          },
          ...d.workoutLogs,
        ],
        workouts: d.workouts.map((w) =>
          w.id === plan.id
            ? { ...w, exercises: w.exercises.map((x) => ({ ...x, done: false })) }
            : w,
        ),
      }));
      toast.success("Workout logged");
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => {
              setErrors({});
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> New routine
          </Button>
        </div>

        {data.workouts.length === 0 ? (
          <Panel delay={60}>
            <EmptyState
              icon={<Dumbbell className="size-5" />}
              title="No routines yet"
              description="Pick exercises from the library and save them as a routine."
            />
          </Panel>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.workouts.map((w, i) => {
              const done = w.exercises.filter((x) => x.done).length;
              const pct = w.exercises.length ? (done / w.exercises.length) * 100 : 0;
              return (
                <Panel key={w.id} delay={60 + i * 40}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-display text-base font-semibold">{w.name}</h3>
                        {w.sample ? <SampleFlag /> : null}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone="primary">{w.category}</Badge>
                        <Badge>{w.durationMin} min</Badge>
                        <Badge>{w.exercises.length} exercises</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${w.name}`}
                      onClick={() => setToDelete(w)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-3">
                    <ProgressBar value={pct} />
                  </div>

                  <ul className="mt-3 space-y-1">
                    {w.exercises.map((x) => {
                      const ex = exerciseById(x.exerciseId);
                      return (
                        <li key={x.id}>
                          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:veil">
                            <input
                              type="checkbox"
                              checked={x.done}
                              onChange={() => toggleExercise(w.id, x.id)}
                              className="size-4 shrink-0 accent-[var(--primary)]"
                            />
                            <span className={`min-w-0 flex-1 truncate ${x.done ? "text-mute line-through" : ""}`}>
                              {ex?.name ?? "Exercise"}
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-mute">
                              {x.sets}×{x.reps}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  <Button variant="primary" className="mt-4 w-full" onClick={() => finish(w)}>
                    <CheckCircle2 className="size-4" /> Log this workout
                  </Button>
                </Panel>
              );
            })}
          </div>
        )}

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          wide
          title="New routine"
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={create}>
                Create routine
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Name" {...(errors["name"] ? { error: errors["name"] } : {})}>
                <Input
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dorm room circuit"
                />
              </Field>
              <Field label="Category">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {WORKOUT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Duration (min)">
                <Input
                  type="number"
                  min={5}
                  max={180}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Exercises ({picked.length} selected)
              </p>
              {errors["picked"] ? (
                <p role="alert" className="mb-2 text-xs font-medium text-destructive">
                  {errors["picked"]}
                </p>
              ) : null}
              <div className="scrollbar-slim max-h-72 space-y-1 overflow-y-auto rounded-xl veil p-2 ring-1 ring-line">
                {EXERCISES.map((ex) => (
                  <label
                    key={ex.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:veil"
                  >
                    <input
                      type="checkbox"
                      checked={picked.includes(ex.id)}
                      onChange={() =>
                        setPicked((p) =>
                          p.includes(ex.id) ? p.filter((x) => x !== ex.id) : [...p, ex.id],
                        )
                      }
                      className="size-4 shrink-0 accent-[var(--primary)]"
                    />
                    <span className="min-w-0 flex-1 truncate">{ex.name}</span>
                    <Badge>{ex.category}</Badge>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={() =>
            toDelete &&
            update((d) => ({ ...d, workouts: d.workouts.filter((x) => x.id !== toDelete.id) }))
          }
          title="Delete this routine?"
          message={`"${toDelete?.name ?? ""}" will be removed. Your logged history stays.`}
        />
      </div>
    );
  }

  function Library() {
    const [cat, setCat] = useState("All");
    const list = useMemo(
      () => EXERCISES.filter((e) => cat === "All" || e.category === cat),
      [cat],
    );
    return (
      <div className="space-y-4">
        <Panel delay={60}>
          <div className="max-w-xs">
            <Field label="Category">
              <Select value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="All">All</option>
                {WORKOUT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Panel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((ex, i) => (
            <Panel key={ex.id} delay={60 + Math.min(i, 12) * 20}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <h3 className="truncate font-display text-sm font-semibold">{ex.name}</h3>
                <Badge tone="primary">{ex.category}</Badge>
              </div>
              <p className="mt-2 text-xs text-mute">{ex.description}</p>
            </Panel>
          ))}
        </div>
      </div>
    );
  }

  function History() {
    const total = data.workoutLogs.reduce((a, l) => a + l.durationMin, 0);
    return (
      <div className="space-y-4">
        <Panel delay={60}>
          <PanelHeading
            title="Training log"
            action={
              data.workoutLogs.length ? (
                <Button size="sm" variant="ghost" onClick={() => update((d) => ({ ...d, workoutLogs: [] }))}>
                  Clear log
                </Button>
              ) : undefined
            }
          />
          <p className="mt-2 text-xs text-mute">
            {data.workoutLogs.length} sessions · {Math.round(total / 60)}h total
          </p>
          {data.workoutLogs.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<Dumbbell className="size-5" />}
                title="Nothing logged yet"
                description="Finish a routine and it will appear here."
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {data.workoutLogs.map((l) => (
                <li key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{l.planName}</p>
                    <p className="text-[11px] text-mute">
                      {formatDate(l.date)} · {l.exercisesDone} exercises
                    </p>
                  </div>
                  <Badge tone="primary">{l.durationMin} min</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    );
  }
}
