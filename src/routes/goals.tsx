import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Target, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Panel,
  ProgressBar,
  Ring,
  SampleFlag,
  Select,
  Tabs,
  Textarea,
} from "@/components/ui-kit";
import { Modal, ConfirmDialog } from "@/components/ui-kit/Modal";
import { useStore } from "@/store/app-store";
import { uid } from "@/lib/sampleData";
import { addDays, isValidISODate, relativeDue, todayISO } from "@/lib/date";
import type { Goal, GoalKind, Milestone } from "@/lib/types";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — StudentOS" },
      {
        name: "description",
        content: "Set daily, weekly and long-term goals, break them into milestones and track progress.",
      },
      { property: "og:title", content: "Goals — StudentOS" },
      {
        property: "og:description",
        content: "Daily, weekly and long-term goals with milestone progress tracking.",
      },
    ],
  }),
  component: GoalsPage,
});

const KINDS: GoalKind[] = ["daily", "weekly", "long-term"];

function GoalsPage() {
  const { data, update } = useStore();
  const [tab, setTab] = useState<GoalKind | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [toDelete, setToDelete] = useState<Goal | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    kind: "weekly" as GoalKind,
    targetDate: addDays(todayISO(), 7),
    milestones: "",
  });

  const visible = data.goals.filter((g) => tab === "all" || g.kind === tab);
  const avg = data.goals.length
    ? Math.round(data.goals.reduce((s, g) => s + g.progress, 0) / data.goals.length)
    : 0;

  function openNew() {
    setEditing(null);
    setDraft({
      title: "",
      description: "",
      kind: "weekly",
      targetDate: addDays(todayISO(), 7),
      milestones: "",
    });
    setErrors({});
    setOpen(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setDraft({
      title: g.title,
      description: g.description,
      kind: g.kind,
      targetDate: g.targetDate,
      milestones: g.milestones.map((m) => m.title).join("\n"),
    });
    setErrors({});
    setOpen(true);
  }

  function save() {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e["title"] = "Name your goal.";
    if (!isValidISODate(draft.targetDate)) e["targetDate"] = "Pick a target date.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const titles = draft.milestones
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);

    if (editing) {
      const id = editing.id;
      update((d) => ({
        ...d,
        goals: d.goals.map((g) => {
          if (g.id !== id) return g;
          const milestones: Milestone[] = titles.map((t, i) => ({
            id: g.milestones[i]?.id ?? uid(),
            title: t,
            done: g.milestones[i]?.done ?? false,
          }));
          return {
            ...g,
            title: draft.title.trim(),
            description: draft.description.trim(),
            kind: draft.kind,
            targetDate: draft.targetDate,
            milestones,
            progress: milestones.length
              ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100)
              : g.progress,
          };
        }),
      }));
      toast.success("Goal updated");
    } else {
      const goal: Goal = {
        id: uid(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        kind: draft.kind,
        targetDate: draft.targetDate,
        progress: 0,
        milestones: titles.map((t) => ({ id: uid(), title: t, done: false })),
      };
      update((d) => ({ ...d, goals: [goal, ...d.goals] }));
      toast.success("Goal created");
    }
    setOpen(false);
  }

  function toggleMilestone(goalId: string, msId: string) {
    update((d) => ({
      ...d,
      goals: d.goals.map((g) => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map((m) => (m.id === msId ? { ...m, done: !m.done } : m));
        return {
          ...g,
          milestones,
          progress: milestones.length
            ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100)
            : g.progress,
        };
      }),
    }));
  }

  function setProgress(goalId: string, value: number) {
    update((d) => ({
      ...d,
      goals: d.goals.map((g) => (g.id === goalId ? { ...g, progress: value } : g)),
    }));
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Goals"
        title="Aim at something specific"
        description="Break big ambitions into milestones and watch the ring fill."
        actions={
          <Button variant="primary" onClick={openNew}>
            <Plus className="size-4" /> New goal
          </Button>
        }
      />

      <Panel delay={60}>
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          <Ring value={avg} size={72} label={`${avg}%`} />
          <div className="min-w-0">
            <p className="font-display text-base font-semibold">Average progress</p>
            <p className="text-xs text-mute">
              {data.goals.length} {data.goals.length === 1 ? "goal" : "goals"} ·{" "}
              {data.goals.filter((g) => g.progress >= 100).length} complete
            </p>
            <div className="mt-3">
              <ProgressBar value={avg} />
            </div>
          </div>
        </div>
      </Panel>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "all", label: "All", count: data.goals.length },
          ...KINDS.map((k) => ({
            value: k,
            label: k[0]!.toUpperCase() + k.slice(1),
            count: data.goals.filter((g) => g.kind === k).length,
          })),
        ]}
        className="max-w-xl"
      />

      {visible.length === 0 ? (
        <Panel delay={100}>
          <EmptyState
            icon={<Target className="size-5" />}
            title="No goals in this view"
            description="Create a goal and add a few milestones to it."
            action={
              <Button variant="primary" size="sm" onClick={openNew}>
                New goal
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((g, i) => (
            <Panel key={g.id} delay={100 + i * 40}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display text-base font-semibold">{g.title}</h3>
                    {g.sample ? <SampleFlag /> : null}
                  </div>
                  <p className="mt-1 text-xs text-mute">{g.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="primary">{g.kind}</Badge>
                    <Badge>{relativeDue(g.targetDate)}</Badge>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Ring value={g.progress} size={44} label={`${g.progress}`} />
                  <Button variant="ghost" size="icon" aria-label="Edit goal" onClick={() => openEdit(g)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete goal"
                    onClick={() => setToDelete(g)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {g.milestones.length > 0 ? (
                <ul className="mt-4 space-y-1.5">
                  {g.milestones.map((m) => (
                    <li key={m.id}>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:veil">
                        <input
                          type="checkbox"
                          checked={m.done}
                          onChange={() => toggleMilestone(g.id, m.id)}
                          className="size-4 shrink-0 accent-[var(--primary)]"
                        />
                        <span className={`min-w-0 truncate ${m.done ? "text-mute line-through" : ""}`}>
                          {m.title}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                    Progress: {g.progress}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={g.progress}
                    onChange={(e) => setProgress(g.id, Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                    aria-label={`Progress for ${g.title}`}
                  />
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit goal" : "New goal"}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              {editing ? "Save changes" : "Create goal"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" {...(errors["title"] ? { error: errors["title"] } : {})}>
            <Input
              value={draft.title}
              maxLength={100}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Finish the data structures course"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={draft.description}
              maxLength={400}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Why does this matter?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select
                value={draft.kind}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value as GoalKind })}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Target date"
              {...(errors["targetDate"] ? { error: errors["targetDate"] } : {})}
            >
              <Input
                type="date"
                value={draft.targetDate}
                onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Milestones" hint="One per line. Ticking them sets progress automatically.">
            <Textarea
              rows={5}
              value={draft.milestones}
              onChange={(e) => setDraft({ ...draft, milestones: e.target.value })}
              placeholder={"Watch lectures 1-4\nSolve 20 problems\nBuild the final project"}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete && update((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== toDelete.id) }))
        }
        title="Delete this goal?"
        message={`"${toDelete?.title ?? ""}" and its milestones will be removed.`}
      />
    </div>
  );
}
