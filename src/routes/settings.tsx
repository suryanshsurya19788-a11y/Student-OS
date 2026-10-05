import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Upload, Trash2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Field,
  Input,
  PageHeader,
  Panel,
  PanelHeading,
  Select,
} from "@/components/ui-kit";
import { ConfirmDialog } from "@/components/ui-kit/Modal";
import { useStore } from "@/store/app-store";
import type { Settings } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StudentOS" },
      {
        name: "description",
        content: "Theme, accent colour, timer defaults, currency, and export or clear your data.",
      },
      { property: "og:title", content: "Settings — StudentOS" },
      {
        property: "og:description",
        content: "Appearance, timer defaults, budget currency, backup, import and data reset.",
      },
    ],
  }),
  component: SettingsPage,
});

const ACCENTS: { value: Settings["accent"]; label: string; color: string }[] = [
  { value: "teal", label: "Teal", color: "oklch(0.785 0.133 181.9)" },
  { value: "violet", label: "Violet", color: "oklch(0.72 0.17 300)" },
  { value: "amber", label: "Amber", color: "oklch(0.82 0.15 78)" },
  { value: "rose", label: "Rose", color: "oklch(0.7 0.18 10)" },
  { value: "emerald", label: "Emerald", color: "oklch(0.75 0.15 155)" },
];

function SettingsPage() {
  const {
    data,
    setSettings,
    exportJSON,
    importJSON,
    clearAll,
    loadSample,
    removeSampleData,
    hasSampleData,
  } = useStore();
  const s = data.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<null | "clear" | "sample" | "removeSample">(null);
  const [importError, setImportError] = useState("");

  const counts = [
    ["Tasks", data.tasks.length],
    ["Study sessions", data.sessions.length],
    ["Subjects", data.subjects.length],
    ["Goals", data.goals.length],
    ["Transactions", data.transactions.length],
    ["Snippets", data.snippets.length],
    ["Recipes", data.recipes.length],
    ["Routines", data.workouts.length],
    ["Focus blocks", data.focusSessions.length],
  ] as const;

  function doExport() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studentos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  }

  function doImport(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setImportError("That file is too large to be a StudentOS backup.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = importJSON(String(reader.result));
      if (res.ok) {
        setImportError("");
        toast.success("Data restored");
      } else {
        setImportError(res.error ?? "Import failed.");
      }
    };
    reader.onerror = () => setImportError("Couldn't read that file.");
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Settings"
        title="Make it yours"
        description="Appearance, defaults and full control over your data."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel delay={60}>
          <PanelHeading title="Profile & appearance" />
          <div className="mt-4 space-y-4">
            <Field label="Display name" hint="Used in the dashboard greeting.">
              <Input
                value={s.displayName}
                maxLength={40}
                onChange={(e) => setSettings({ displayName: e.target.value })}
                placeholder="Alex"
              />
            </Field>
            <Field label="Theme">
              <Select
                value={s.theme}
                onChange={(e) => setSettings({ theme: e.target.value as Settings["theme"] })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </Select>
            </Field>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Accent colour
              </p>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setSettings({ accent: a.value })}
                    aria-pressed={s.accent === a.value}
                    aria-label={`Use ${a.label} accent`}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ring-1 transition-colors ${
                      s.accent === a.value ? "ring-primary" : "ring-line text-mute hover:text-ink"
                    }`}
                  >
                    <span className="size-3.5 rounded-full" style={{ background: a.color }} />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel delay={90}>
          <PanelHeading title="Defaults" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Focus length (min)">
              <Input
                type="number"
                min={5}
                max={180}
                value={s.focusMinutes}
                onChange={(e) =>
                  setSettings({ focusMinutes: Math.max(1, Number(e.target.value) || 25) })
                }
              />
            </Field>
            <Field label="Break length (min)">
              <Input
                type="number"
                min={1}
                max={60}
                value={s.breakMinutes}
                onChange={(e) =>
                  setSettings({ breakMinutes: Math.max(1, Number(e.target.value) || 5) })
                }
              />
            </Field>
            <Field label="Week starts on">
              <Select
                value={String(s.weekStart)}
                onChange={(e) => setSettings({ weekStart: Number(e.target.value) === 1 ? 1 : 0 })}
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
              </Select>
            </Field>
            <Field label="Currency symbol">
              <Input
                value={s.currency}
                maxLength={3}
                onChange={(e) => setSettings({ currency: e.target.value })}
              />
            </Field>
            <Field label="Monthly budget">
              <Input
                type="number"
                min={0}
                value={s.monthlyBudget}
                onChange={(e) => setSettings({ monthlyBudget: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Timer chime" hint="Plays a short sound when a block ends.">
              <Select
                value={s.notifications ? "on" : "off"}
                onChange={(e) => setSettings({ notifications: e.target.value === "on" })}
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </Select>
            </Field>
          </div>
        </Panel>
      </div>

      <Panel delay={120}>
        <PanelHeading title="Your data" action={<Badge tone="primary">Stored on this device</Badge>} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {counts.map(([label, n]) => (
            <div key={label} className="rounded-xl veil p-3 ring-1 ring-line">
              <p className="text-[11px] uppercase tracking-[0.14em] text-mute">{label}</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{n}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" onClick={doExport}>
            <Download className="size-4" /> Export backup
          </Button>
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Import backup
          </Button>
          <Button onClick={() => setConfirm("sample")}>
            <Sparkles className="size-4" /> Load sample data
          </Button>
          {hasSampleData ? (
            <Button onClick={() => setConfirm("removeSample")}>Remove sample data</Button>
          ) : null}
          <Button variant="danger" onClick={() => setConfirm("clear")}>
            <Trash2 className="size-4" /> Clear everything
          </Button>
        </div>
        {importError ? (
          <p role="alert" className="mt-3 text-xs font-medium text-destructive">
            {importError}
          </p>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Import a StudentOS backup file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) doImport(f);
            e.target.value = "";
          }}
        />
      </Panel>

      <Panel delay={150}>
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-sm font-semibold">Privacy by design</h2>
            <p className="mt-1 text-xs text-mute">
              StudentOS has no accounts, no servers and no analytics. Everything you type is saved
              in this browser's local storage and stays there. Clearing your browser data removes
              it, so export a backup before switching devices.
            </p>
          </div>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirm === "clear"}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          clearAll();
          toast.success("All data cleared");
        }}
        title="Clear all StudentOS data?"
        message="Tasks, sessions, goals, expenses, snippets, recipes and routines will be deleted from this device. This cannot be undone — export a backup first if you might want it back."
        confirmLabel="Delete everything"
      />

      <ConfirmDialog
        open={confirm === "sample"}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          loadSample();
          toast.success("Sample data loaded");
        }}
        title="Replace with sample data?"
        message="Your current content will be replaced by the example dataset. Your settings are kept."
        confirmLabel="Load sample"
        danger={false}
      />

      <ConfirmDialog
        open={confirm === "removeSample"}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          removeSampleData();
          toast.success("Sample data removed");
        }}
        title="Remove the sample content?"
        message="Only items marked as Sample are removed. Anything you created stays."
        confirmLabel="Remove samples"
      />
    </div>
  );
}
