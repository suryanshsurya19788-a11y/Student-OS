import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarRange, Plus, Trash2, GraduationCap } from "lucide-react";
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
  SampleFlag,
  Select,
  Tabs,
} from "@/components/ui-kit";
import { Modal, ConfirmDialog } from "@/components/ui-kit/Modal";
import { useStore } from "@/store/app-store";
import { uid } from "@/lib/sampleData";
import {
  addDays,
  dayShort,
  formatDate,
  isValidISODate,
  minutesToHM,
  relativeDue,
  startOfWeek,
  todayISO,
  weekDates,
} from "@/lib/date";
import { PRIORITIES, SUBJECT_COLORS, type Exam, type Priority, type StudySession, type Subject } from "@/lib/types";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — StudentOS" },
      {
        name: "description",
        content: "Plan study sessions across the week, manage subjects and count down to exams.",
      },
      { property: "og:title", content: "Study Planner — StudentOS" },
      {
        property: "og:description",
        content: "Weekly study sessions, subjects and exam countdowns, stored on your device.",
      },
    ],
  }),
  component: PlannerPage,
});

type Tab = "week" | "subjects" | "exams";

function PlannerPage() {
  const { data, update } = useStore();
  const [tab, setTab] = useState<Tab>("week");
  const [anchor, setAnchor] = useState(() => startOfWeek(todayISO(), data.settings.weekStart));

  const week = useMemo(
    () => weekDates(anchor, data.settings.weekStart),
    [anchor, data.settings.weekStart],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Study planner"
        title="Your week, blocked out"
        description="Schedule sessions per subject, then tick them off as you go."
      />

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "week", label: "Weekly schedule", count: data.sessions.length },
          { value: "subjects", label: "Subjects", count: data.subjects.length },
          { value: "exams", label: "Exams", count: data.exams.length },
        ]}
        className="max-w-lg"
      />

      {tab === "week" ? (
        <WeekView week={week} anchor={anchor} onAnchor={setAnchor} />
      ) : tab === "subjects" ? (
        <SubjectsView />
      ) : (
        <ExamsView />
      )}
    </div>
  );

  function WeekView({
    week,
    anchor,
    onAnchor,
  }: {
    week: string[];
    anchor: string;
    onAnchor: (v: string) => void;
  }) {
    const [open, setOpen] = useState(false);
    const [day, setDay] = useState(todayISO());
    const [draft, setDraft] = useState({
      title: "",
      subjectId: data.subjects[0]?.id ?? "",
      date: todayISO(),
      startTime: "09:00",
      duration: "60",
      priority: "medium" as Priority,
      location: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toDelete, setToDelete] = useState<StudySession | null>(null);

    const weekMinutes = data.sessions
      .filter((s) => week.includes(s.date) && s.completed)
      .reduce((a, s) => a + s.duration, 0);

    function openFor(date: string) {
      setDay(date);
      setDraft((d) => ({ ...d, date, subjectId: d.subjectId || (data.subjects[0]?.id ?? "") }));
      setErrors({});
      setOpen(true);
    }

    function save() {
      const e: Record<string, string> = {};
      if (!draft.title.trim()) e["title"] = "Add a session title.";
      if (!isValidISODate(draft.date)) e["date"] = "Pick a valid date.";
      if (!/^\d{2}:\d{2}$/.test(draft.startTime)) e["startTime"] = "Pick a start time.";
      const dur = Number(draft.duration);
      if (!Number.isFinite(dur) || dur <= 0 || dur > 600) e["duration"] = "1–600 minutes.";
      setErrors(e);
      if (Object.keys(e).length) return;

      const session: StudySession = {
        id: uid(),
        subjectId: draft.subjectId,
        title: draft.title.trim(),
        date: draft.date,
        startTime: draft.startTime,
        duration: dur,
        priority: draft.priority,
        completed: false,
        ...(draft.location.trim() ? { location: draft.location.trim() } : {}),
      };
      update((d) => ({ ...d, sessions: [...d.sessions, session] }));
      toast.success("Session scheduled");
      setOpen(false);
      setDraft((d) => ({ ...d, title: "", location: "" }));
    }

    const subject = (id: string) => data.subjects.find((s) => s.id === id);

    return (
      <div className="space-y-4">
        <Panel delay={60}>
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="font-display text-base font-semibold">
                {formatDate(week[0] as string)} – {formatDate(week[6] as string)}
              </p>
              <p className="text-xs text-mute">{minutesToHM(weekMinutes)} studied this week</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button size="sm" onClick={() => onAnchor(addDays(anchor, -7))}>
                Previous
              </Button>
              <Button size="sm" onClick={() => onAnchor(startOfWeek(todayISO(), data.settings.weekStart))}>
                This week
              </Button>
              <Button size="sm" onClick={() => onAnchor(addDays(anchor, 7))}>
                Next
              </Button>
              <Button size="sm" variant="primary" onClick={() => openFor(todayISO())}>
                <Plus className="size-4" /> Session
              </Button>
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {week.map((iso, i) => {
            const items = data.sessions
              .filter((s) => s.date === iso)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = iso === todayISO();
            return (
              <Panel
                key={iso}
                delay={80 + i * 30}
                className={isToday ? "ring-1 ring-primary/40" : ""}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold">
                      {dayShort(iso)} {formatDate(iso)}
                    </p>
                    <p className="text-[11px] text-mute">
                      {items.length} {items.length === 1 ? "session" : "sessions"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Add session on ${formatDate(iso)}`}
                    onClick={() => openFor(iso)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-[11px] text-mute">
                      Free
                    </p>
                  ) : (
                    items.map((s) => (
                      <div key={s.id} className="rounded-xl veil-soft p-3 ring-1 ring-line">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold">{s.title}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-mute">
                              <span
                                className="size-1.5 shrink-0 rounded-full"
                                style={{ background: subject(s.subjectId)?.color ?? "var(--primary)" }}
                              />
                              <span className="truncate">
                                {subject(s.subjectId)?.name ?? "General"} · {s.startTime} · {s.duration}m
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => setToDelete(s)}
                            aria-label={`Delete ${s.title}`}
                            className="shrink-0 text-mute transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-mute">
                            <input
                              type="checkbox"
                              checked={s.completed}
                              onChange={() =>
                                update((d) => ({
                                  ...d,
                                  sessions: d.sessions.map((x) =>
                                    x.id === s.id ? { ...x, completed: !x.completed } : x,
                                  ),
                                }))
                              }
                              className="size-3.5 accent-[var(--primary)]"
                            />
                            Done
                          </label>
                          {s.sample ? <SampleFlag /> : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            );
          })}
        </div>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Schedule a study session"
          description={`Adding to ${formatDate(day)}`}
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={save}>
                Add session
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
                placeholder="Revise integration by parts"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Subject">
                <Select
                  value={draft.subjectId}
                  onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
                >
                  <option value="">General</option>
                  {data.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Date" {...(errors["date"] ? { error: errors["date"] } : {})}>
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </Field>
              <Field label="Start" {...(errors["startTime"] ? { error: errors["startTime"] } : {})}>
                <Input
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                />
              </Field>
              <Field
                label="Duration (min)"
                {...(errors["duration"] ? { error: errors["duration"] } : {})}
              >
                <Input
                  type="number"
                  min={1}
                  max={600}
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
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
              <Field label="Location">
                <Input
                  value={draft.location}
                  maxLength={60}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="Library, room 2"
                />
              </Field>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={() =>
            toDelete &&
            update((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== toDelete.id) }))
          }
          title="Delete this session?"
          message={`"${toDelete?.title ?? ""}" will be removed from your planner.`}
        />
      </div>
    );
  }

  function SubjectsView() {
    const [name, setName] = useState("");
    const [teacher, setTeacher] = useState("");
    const [color, setColor] = useState(SUBJECT_COLORS[0] as string);
    const [error, setError] = useState("");
    const [toDelete, setToDelete] = useState<Subject | null>(null);

    function add() {
      if (!name.trim()) {
        setError("Name the subject first.");
        return;
      }
      if (data.subjects.some((s) => s.name.toLowerCase() === name.trim().toLowerCase())) {
        setError("You already have that subject.");
        return;
      }
      setError("");
      update((d) => ({
        ...d,
        subjects: [
          ...d.subjects,
          {
            id: uid(),
            name: name.trim(),
            color,
            ...(teacher.trim() ? { teacher: teacher.trim() } : {}),
          },
        ],
      }));
      setName("");
      setTeacher("");
      toast.success("Subject added");
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel delay={60}>
          <PanelHeading title="Add subject" />
          <div className="mt-4 space-y-4">
            <Field label="Name" {...(error ? { error } : {})}>
              <Input value={name} maxLength={50} onChange={(e) => setName(e.target.value)} placeholder="Discrete Maths" />
            </Field>
            <Field label="Teacher">
              <Input value={teacher} maxLength={50} onChange={(e) => setTeacher(e.target.value)} placeholder="Optional" />
            </Field>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Colour
              </p>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={`Use colour ${c}`}
                    aria-pressed={color === c}
                    className={`size-7 rounded-lg ring-2 transition-transform hover:scale-110 ${
                      color === c ? "ring-ink" : "ring-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <Button variant="primary" className="w-full" onClick={add}>
              <Plus className="size-4" /> Add subject
            </Button>
          </div>
        </Panel>

        <div className="space-y-3">
          {data.subjects.length === 0 ? (
            <Panel delay={90}>
              <EmptyState
                icon={<CalendarRange className="size-5" />}
                title="No subjects yet"
                description="Add your courses so sessions and exams can be colour-coded."
              />
            </Panel>
          ) : (
            data.subjects.map((s, i) => {
              const sessions = data.sessions.filter((x) => x.subjectId === s.id);
              const done = sessions.filter((x) => x.completed).length;
              return (
                <Panel key={s.id} delay={90 + i * 30}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <span className="size-9 shrink-0 rounded-xl" style={{ background: s.color }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display text-sm font-semibold">{s.name}</p>
                        {s.sample ? <SampleFlag /> : null}
                      </div>
                      <p className="truncate text-xs text-mute">
                        {s.teacher ? `${s.teacher} · ` : ""}
                        {done}/{sessions.length} sessions done
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${s.name}`}
                      onClick={() => setToDelete(s)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </Panel>
              );
            })
          )}
        </div>

        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={() =>
            toDelete &&
            update((d) => ({
              ...d,
              subjects: d.subjects.filter((x) => x.id !== toDelete.id),
              sessions: d.sessions.map((x) =>
                x.subjectId === toDelete.id ? { ...x, subjectId: "" } : x,
              ),
            }))
          }
          title="Delete this subject?"
          message="Its sessions stay, but they'll no longer be colour-coded."
        />
      </div>
    );
  }

  function ExamsView() {
    const [draft, setDraft] = useState({
      title: "",
      subjectId: "",
      date: addDays(todayISO(), 14),
      startTime: "09:00",
      notes: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toDelete, setToDelete] = useState<Exam | null>(null);

    const sorted = [...data.exams].sort((a, b) => a.date.localeCompare(b.date));

    function add() {
      const e: Record<string, string> = {};
      if (!draft.title.trim()) e["title"] = "Name the exam.";
      if (!isValidISODate(draft.date)) e["date"] = "Pick a valid date.";
      setErrors(e);
      if (Object.keys(e).length) return;
      update((d) => ({
        ...d,
        exams: [
          ...d.exams,
          {
            id: uid(),
            title: draft.title.trim(),
            subjectId: draft.subjectId,
            date: draft.date,
            startTime: draft.startTime,
            ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
          },
        ],
      }));
      setDraft({ ...draft, title: "", notes: "" });
      toast.success("Exam added");
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel delay={60}>
          <PanelHeading title="Add exam" />
          <div className="mt-4 space-y-4">
            <Field label="Title" {...(errors["title"] ? { error: errors["title"] } : {})}>
              <Input
                value={draft.title}
                maxLength={80}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Calculus II final"
              />
            </Field>
            <Field label="Subject">
              <Select
                value={draft.subjectId}
                onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
              >
                <option value="">General</option>
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" {...(errors["date"] ? { error: errors["date"] } : {})}>
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </Field>
              <Field label="Time">
                <Input
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                />
              </Field>
            </div>
            <Button variant="primary" className="w-full" onClick={add}>
              <Plus className="size-4" /> Add exam
            </Button>
          </div>
        </Panel>

        <div className="space-y-3">
          {sorted.length === 0 ? (
            <Panel delay={90}>
              <EmptyState
                icon={<GraduationCap className="size-5" />}
                title="No exams tracked"
                description="Add exam dates and you'll get a countdown here."
              />
            </Panel>
          ) : (
            sorted.map((x, i) => {
              const subj = data.subjects.find((s) => s.id === x.subjectId);
              const past = x.date < todayISO();
              return (
                <Panel key={x.id} delay={90 + i * 30}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-display text-sm font-semibold">{x.title}</p>
                        {x.sample ? <SampleFlag /> : null}
                      </div>
                      <p className="truncate text-xs text-mute">
                        {subj?.name ?? "General"} · {formatDate(x.date)} at {x.startTime}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={past ? "neutral" : "accent2"}>{relativeDue(x.date)}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${x.title}`}
                        onClick={() => setToDelete(x)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Panel>
              );
            })
          )}
        </div>

        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={() =>
            toDelete && update((d) => ({ ...d, exams: d.exams.filter((x) => x.id !== toDelete.id) }))
          }
          title="Delete this exam?"
          message={`"${toDelete?.title ?? ""}" will be removed.`}
        />
      </div>
    );
  }
}
