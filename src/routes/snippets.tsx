import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Code2, Copy, Plus, Search, Star, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Panel,
  SampleFlag,
  Select,
  Textarea,
} from "@/components/ui-kit";
import { Modal, ConfirmDialog } from "@/components/ui-kit/Modal";
import { useStore } from "@/store/app-store";
import { uid } from "@/lib/sampleData";
import { todayISO } from "@/lib/date";
import type { Snippet } from "@/lib/types";

export const Route = createFileRoute("/snippets")({
  head: () => ({
    meta: [
      { title: "Code Snippets — StudentOS" },
      {
        name: "description",
        content: "Save, tag and copy the code snippets you keep looking up, stored on your device.",
      },
      { property: "og:title", content: "Code Snippets — StudentOS" },
      {
        property: "og:description",
        content: "A personal, offline snippet library with tags, search and one-click copy.",
      },
    ],
  }),
  component: SnippetsPage,
});

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "SQL",
  "HTML",
  "CSS",
  "Bash",
  "Other",
];

function SnippetsPage() {
  const { data, update } = useStore();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("All");
  const [favOnly, setFavOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [toDelete, setToDelete] = useState<Snippet | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState({
    title: "",
    language: "TypeScript",
    description: "",
    tags: "",
    code: "",
  });

  const languages = useMemo(
    () => ["All", ...Array.from(new Set(data.snippets.map((s) => s.language))).sort()],
    [data.snippets],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.snippets
      .filter((s) => lang === "All" || s.language === lang)
      .filter((s) => !favOnly || s.favorite)
      .filter(
        (s) =>
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }, [data.snippets, query, lang, favOnly]);

  function openNew() {
    setEditing(null);
    setDraft({ title: "", language: "TypeScript", description: "", tags: "", code: "" });
    setErrors({});
    setOpen(true);
  }

  function openEdit(s: Snippet) {
    setEditing(s);
    setDraft({
      title: s.title,
      language: s.language,
      description: s.description,
      tags: s.tags.join(", "),
      code: s.code,
    });
    setErrors({});
    setOpen(true);
  }

  function save() {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e["title"] = "Give the snippet a title.";
    if (!draft.code.trim()) e["code"] = "The snippet needs some code.";
    if (draft.code.length > 20000) e["code"] = "That snippet is too long.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const tags = draft.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (editing) {
      const id = editing.id;
      update((d) => ({
        ...d,
        snippets: d.snippets.map((s) =>
          s.id === id
            ? {
                ...s,
                title: draft.title.trim(),
                language: draft.language,
                description: draft.description.trim(),
                tags,
                code: draft.code,
              }
            : s,
        ),
      }));
      toast.success("Snippet updated");
    } else {
      const snippet: Snippet = {
        id: uid(),
        title: draft.title.trim(),
        language: draft.language,
        description: draft.description.trim(),
        tags,
        code: draft.code,
        favorite: false,
        createdAt: todayISO(),
      };
      update((d) => ({ ...d, snippets: [snippet, ...d.snippets] }));
      toast.success("Snippet saved");
    }
    setOpen(false);
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Your browser blocked clipboard access");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Code snippets"
        title="Stop rewriting the same twelve lines"
        description="Tag them, search them, copy them. Nothing leaves this device."
        actions={
          <Button variant="primary" onClick={openNew}>
            <Plus className="size-4" /> New snippet
          </Button>
        }
      />

      <Panel delay={60}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, code or tags"
              aria-label="Search snippets"
              className="pl-9"
            />
          </div>
          <Select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Filter language">
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          <Button
            variant={favOnly ? "primary" : "secondary"}
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
          >
            <Star className="size-4" /> Favourites
          </Button>
        </div>
      </Panel>

      {visible.length === 0 ? (
        <Panel delay={100}>
          <EmptyState
            icon={<Code2 className="size-5" />}
            title="No snippets match"
            description="Adjust the filters or save a new snippet."
            action={
              <Button variant="primary" size="sm" onClick={openNew}>
                New snippet
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visible.map((s, i) => (
            <Panel key={s.id} delay={100 + i * 30}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display text-sm font-semibold">{s.title}</h3>
                    <Badge tone="primary">{s.language}</Badge>
                    {s.sample ? <SampleFlag /> : null}
                  </div>
                  {s.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-mute">{s.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={s.favorite ? "Remove from favourites" : "Add to favourites"}
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        snippets: d.snippets.map((x) =>
                          x.id === s.id ? { ...x, favorite: !x.favorite } : x,
                        ),
                      }))
                    }
                  >
                    <Star className={`size-4 ${s.favorite ? "fill-current text-warning" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Copy code" onClick={() => copy(s.code)}>
                    <Copy className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Edit snippet" onClick={() => openEdit(s)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete snippet"
                    onClick={() => setToDelete(s)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <pre className="scrollbar-slim mt-3 max-h-56 overflow-auto rounded-xl veil p-3 text-[12px] leading-relaxed ring-1 ring-line">
                <code className="font-mono">{s.code}</code>
              </pre>

              {s.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <Badge key={t}>#{t}</Badge>
                  ))}
                </div>
              ) : null}
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        wide
        title={editing ? "Edit snippet" : "New snippet"}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              {editing ? "Save changes" : "Save snippet"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <Field label="Title" {...(errors["title"] ? { error: errors["title"] } : {})}>
              <Input
                value={draft.title}
                maxLength={80}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Debounce helper"
              />
            </Field>
            <Field label="Language">
              <Select
                value={draft.language}
                onChange={(e) => setDraft({ ...draft, language: e.target.value })}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Input
              value={draft.description}
              maxLength={160}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="What it does and when to reach for it"
            />
          </Field>
          <Field label="Tags" hint="Comma separated, up to 8.">
            <Input
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="react, hooks, utils"
            />
          </Field>
          <Field label="Code" {...(errors["code"] ? { error: errors["code"] } : {})}>
            <Textarea
              rows={12}
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              spellCheck={false}
              className="font-mono text-[12px]"
              placeholder="function debounce(fn, ms) { ... }"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          update((d) => ({ ...d, snippets: d.snippets.filter((x) => x.id !== toDelete.id) }))
        }
        title="Delete this snippet?"
        message={`"${toDelete?.title ?? ""}" will be removed permanently.`}
      />
    </div>
  );
}
