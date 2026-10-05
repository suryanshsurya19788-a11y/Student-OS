import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckSquare, Plus, Pencil, Trash2, Search } from "lucide-react";
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
  Select,
  SampleFlag,
  Tabs,
  Textarea,
} from "@/components/ui-kit";
import { Modal, ConfirmDialog } from "@/components/ui-kit/Modal";
import { useStore } from "@/store/app-store";
import { uid } from "@/lib/sampleData";
import { isValidISODate, relativeDue, todayISO } from "@/lib/date";
import { PRIORITIES, TASK_CATEGORIES, type Priority, type Task, type TaskCategory } from "@/lib/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — StudentOS" },
      {
        name: "description",
        content: "Capture homework, assignments and personal to-dos with due dates and priorities.",
      },
      { property: "og:title", content: "Tasks — StudentOS" },
      {
        property: "og:description",
        content: "Homework, assignments and to-dos with due dates and priorities.",
      },
    ],
  }),
  component: TasksPage,
});

type Filter = "all" | "today" | "upcoming" | "overdue" | "done";

interface Draft {
  title: string;
  description: string;
  due: string;
  priority: Priority;
  category: TaskCategory;
}

const blank: Draft = {
  title: "",
  description: "",
  due: todayISO(),
  priority: "medium",
  category: "Homework",
};

function TasksPage() {
  const { data, update } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const today = todayISO();

  const counts = useMemo(() => {
    const active = data.tasks.filter((t) => !t.completed);
    return {
      all: data.tasks.length,
      today: active.filter((t) => t.due === today).length,
      upcoming: active.filter((t) => t.due > today).length,
      overdue: active.filter((t) => t.due && t.due < today).length,
      done: data.tasks.filter((t) => t.completed).length,
    };
  }, [data.tasks, today]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.tasks
      .filter((t) => {
        if (filter === "today") return !t.completed && t.due === today;
        if (filter === "upcoming") return !t.completed && t.due > today;
        if (filter === "overdue") return !t.completed && !!t.due && t.due < today;
        if (filter === "done") return t.completed;
        return true;
      })
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.due || "9999").localeCompare(b.due || "9999");
      });
  }, [data.tasks, filter, query, today]);

  const donePct = data.tasks.length ? (counts.done / data.tasks.length) * 100 : 0;

  function openNew() {
    setEditing(null);
    setDraft(blank);
    setErrors({});
    setOpen(true);
  }

  function openEdit(t: Task) {
    setEditing(t);
    setDraft({
      title: t.title,
      description: t.description,
      due: t.due,
      priority: t.priority,
      category: t.category,
    });
    setErrors({});
    setOpen(true);
  }

  function save() {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next["title"] = "Give the task a title.";
    if (draft.title.length > 120) next["title"] = "Keep the title under 120 characters.";
    if (draft.due && !isValidISODate(draft.due)) next["due"] = "Use a real date.";
    if (draft.description.length > 1000) next["description"] = "Description is too long.";
    setErrors(next);
    if (Object.keys(next).length) return;

    if (editing) {
      const id = editing.id;
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                title: draft.title.trim(),
                description: draft.description.trim(),
                due: draft.due,
                priority: draft.priority,
                category: draft.category,
              }
            : t,
        ),
      }));
      toast.success("Task updated");
    } else {
      const task: Task = {
        id: uid(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        due: draft.due,
        priority: draft.priority,
        category: draft.category,
        completed: false,
        createdAt: today,
      };
      update((d) => ({ ...d, tasks: [task, ...d.tasks] }));
      toast.success("Task added");
    }
    setOpen(false);
  }

  function toggle(t: Task) {
    update((d) => ({
      ...d,
      tasks: d.tasks.map((x) =>
        x.id === t.id ? { ...x, completed: !x.completed, completedAt: today } : x,
      ),
    }));
  }

  function remove(t: Task) {
    update((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== t.id) }));
    toast.success("Task deleted");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Tasks"
        title="Everything you owe future you"
        description="Due dates, priorities and categories — stored only on this device."
        actions={
          <Button variant="primary" onClick={openNew}>
            <Plus className="size-4" /> New task
          </Button>
        }
      />

      <Panel delay={60}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Tabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "today", label: "Today", count: counts.today },
              { value: "upcoming", label: "Upcoming", count: counts.upcoming },
              { value: "overdue", label: "Overdue", count: counts.overdue },
              { value: "done", label: "Done", count: counts.done },
            ]}
          />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              aria-label="Search tasks"
              className="pl-9"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={donePct} className="flex-1" />
          <span className="shrink-0 text-xs tabular-nums text-mute">
            {counts.done}/{data.tasks.length} done
          </span>
        </div>
      </Panel>

      {visible.length === 0 ? (
        <Panel delay={100}>
          <EmptyState
            icon={<CheckSquare className="size-5" />}
            title="No tasks here"
            description="Add a task to start tracking what's due."
            action={
              <Button variant="primary" size="sm" onClick={openNew}>
                Add task
              </Button>
            }
          />
        </Panel>
      ) : (
        <ul className="space-y-2">
          {visible.map((t, i) => {
            const overdue = !t.completed && !!t.due && t.due < today;
            return (
              <li
                key={t.id}
                className="panel rise grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-4"
                style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
              >
                <button
                  onClick={() => toggle(t)}
                  aria-label={t.completed ? `Mark ${t.title} as not done` : `Mark ${t.title} as done`}
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md ring-1 transition-colors ${
                    t.completed ? "bg-primary text-primary-foreground ring-primary" : "ring-line hover:ring-primary"
                  }`}
                >
                  {t.completed ? <CheckSquare className="size-3.5" /> : null}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`truncate text-sm font-semibold ${
                        t.completed ? "text-mute line-through" : ""
                      }`}
                    >
                      {t.title}
                    </p>
                    {t.sample ? <SampleFlag /> : null}
                  </div>
                  {t.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-mute">{t.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge>{t.category}</Badge>
                    <Badge
                      tone={t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "neutral"}
                    >
                      {t.priority}
                    </Badge>
                    {t.due ? (
                      <Badge tone={overdue ? "danger" : "primary"}>{relativeDue(t.due)}</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit task" onClick={() => openEdit(t)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete task"
                    onClick={() => setToDelete(t)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit task" : "New task"}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              {editing ? "Save changes" : "Add task"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" {...(errors["title"] ? { error: errors["title"] } : {})}>
            <Input
              value={draft.title}
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Finish physics problem set"
            />
          </Field>
          <Field
            label="Description"
            {...(errors["description"] ? { error: errors["description"] } : {})}
          >
            <Textarea
              value={draft.description}
              maxLength={1000}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Optional details"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Due date" {...(errors["due"] ? { error: errors["due"] } : {})}>
              <Input
                type="date"
                value={draft.due}
                onChange={(e) => setDraft({ ...draft, due: e.target.value })}
              />
            </Field>
            <Field label="Priority">
              <Select
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category">
              <Select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as TaskCategory })}
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete this task?"
        message={`"${toDelete?.title ?? ""}" will be removed permanently from this device.`}
      />
    </div>
  );
}
