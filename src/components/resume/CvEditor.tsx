import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, X, Camera } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Input, Panel, PanelHeading, Select, Textarea } from "@/components/ui-kit";
import { Modal } from "@/components/ui-kit/Modal";
import { uid } from "@/lib/sampleData";
import {
  CONTACT_LABELS,
  newAchievement,
  newCertification,
  newCreative,
  newEducation,
  newExperience,
  newProject,
  type ContactKey,
  type CvData,
} from "@/lib/cv";

type Update = (fn: (cv: CvData) => CvData) => void;

/* ------------------------------ Generic list ----------------------------- */

function ListEditor<T extends { id: string }>({
  title,
  items,
  onChange,
  make,
  render,
  addLabel,
  itemLabel,
  delay,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, set: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
  itemLabel: (item: T) => string;
  delay?: number;
}) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j] as T, next[i] as T];
    onChange(next);
  };
  return (
    <Panel {...(delay ? { delay } : {})}>
      <PanelHeading
        title={title}
        action={
          <Button size="sm" onClick={() => onChange([...items, make()])}>
            <Plus className="size-4" /> {addLabel}
          </Button>
        }
      />
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-mute">Optional — leave empty to hide this section.</p>
        ) : null}
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl veil-soft p-3 ring-1 ring-line">
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <p className="truncate text-xs font-semibold text-mute">
                {itemLabel(item) || `New ${title.toLowerCase()} entry`}
              </p>
              <div className="flex gap-0.5">
                <Button variant="ghost" size="icon" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move down"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove entry"
                  onClick={() => onChange(items.filter((x) => x.id !== item.id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            {render(item, (patch) =>
              onChange(items.map((x) => (x.id === item.id ? { ...x, ...patch } : x))),
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------- Tag editor ------------------------------ */

function TagEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...values, ...parts.filter((p) => !values.includes(p))].slice(0, 30));
    setDraft("");
  };
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">{label}</p>
      <div className="flex gap-2">
        <Input
          value={draft}
          maxLength={80}
          placeholder={placeholder}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button onClick={add} aria-label={`Add ${label}`}>
          <Plus className="size-4" />
        </Button>
      </div>
      {values.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full veil px-2.5 py-1 text-xs ring-1 ring-line">
              {v}
              <button
                aria-label={`Remove ${v}`}
                className="text-mute hover:text-destructive"
                onClick={() => onChange(values.filter((x) => x !== v))}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------- Photo field ----------------------------- */

function PhotoField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState("");

  function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Centre-crop to a square and downscale so it stays small in local storage.
        const side = Math.min(img.width, img.height);
        const size = Math.min(400, side);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        setPending(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => toast.error("Couldn't read that image");
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-4">
      {value ? (
        <img src={value} alt="Profile" className="size-16 shrink-0 rounded-full object-cover ring-1 ring-line" />
      ) : (
        <div className="grid size-16 shrink-0 place-items-center rounded-full veil text-mute ring-1 ring-line">
          <Camera className="size-5" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => ref.current?.click()}>
          {value ? "Replace photo" : "Upload photo"}
        </Button>
        {value ? (
          <Button size="sm" variant="ghost" onClick={() => onChange("")}>
            Remove
          </Button>
        ) : null}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload profile photo"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Modal
        open={!!pending}
        onClose={() => setPending("")}
        title="Use this photo?"
        description="It's cropped to a circle and stays on this device."
        footer={
          <>
            <Button onClick={() => setPending("")}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                onChange(pending);
                setPending("");
                toast.success("Photo saved");
              }}
            >
              Save photo
            </Button>
          </>
        }
      >
        <div className="grid place-items-center py-2">
          {pending ? <img src={pending} alt="Photo preview" className="size-44 rounded-full object-cover ring-1 ring-line" /> : null}
        </div>
      </Modal>
    </div>
  );
}

/* --------------------------------- Editor -------------------------------- */

const Check = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-mute">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--primary)]" />
    {label}
  </label>
);

export function CvEditor({ cv, update }: { cv: CvData; update: Update }) {
  const set = (patch: Partial<CvData>) => update((c) => ({ ...c, ...patch }));
  const setP = (k: keyof CvData["personal"], v: string) =>
    update((c) => ({ ...c, personal: { ...c.personal, [k]: v } }));

  return (
    <div className="space-y-4">
      <Panel delay={60}>
        <PanelHeading title="Personal details" />
        <div className="mt-4">
          <PhotoField value={cv.personal.photo} onChange={(v) => setP("photo", v)} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["name", "Full name", "Your full name"],
              ["headline", "Headline", "e.g. Biology Student | Web Developer"],
              ["email", "Email", "you@email.com"],
              ["phone", "Phone", "+91 …"],
              ["location", "Location", "City, Country"],
              ["website", "Portfolio / website", "yoursite.com"],
              ["github", "GitHub", "github.com/username"],
              ["linkedin", "LinkedIn", "linkedin.com/in/username"],
            ] as const
          ).map(([k, label, ph]) => (
            <Field key={k} label={label}>
              <Input
                value={cv.personal[k]}
                maxLength={120}
                placeholder={ph}
                type={k === "email" ? "email" : "text"}
                onChange={(e) => setP(k, e.target.value)}
              />
            </Field>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Tagline" hint="One short line under your headline.">
            <Input value={cv.personal.tagline} maxLength={140} onChange={(e) => setP("tagline", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
            Show in header
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {(Object.keys(CONTACT_LABELS) as ContactKey[]).map((k) => (
              <Check
                key={k}
                label={CONTACT_LABELS[k]}
                checked={cv.showContact[k]}
                onChange={(v) => set({ showContact: { ...cv.showContact, [k]: v } })}
              />
            ))}
          </div>
        </div>
      </Panel>

      <Panel delay={80}>
        <PanelHeading title="Professional summary" />
        <div className="mt-4">
          <Textarea
            rows={5}
            maxLength={900}
            value={cv.summary}
            aria-label="Professional summary"
            placeholder="Two or three sentences about who you are and what you're looking for."
            onChange={(e) => set({ summary: e.target.value })}
          />
        </div>
      </Panel>

      <ListEditor
        title="Education"
        addLabel="Add"
        items={cv.education}
        onChange={(education) => set({ education })}
        make={newEducation}
        itemLabel={(e) => e.degree || e.institution}
        render={(e, s) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Degree" aria-label="Degree" value={e.degree} onChange={(v) => s({ degree: v.target.value })} />
              <Input placeholder="Institution" aria-label="Institution" value={e.institution} onChange={(v) => s({ institution: v.target.value })} />
              <Input placeholder="Location" aria-label="Location" value={e.location} onChange={(v) => s({ location: v.target.value })} />
              <Check label="Currently studying" checked={e.current} onChange={(v) => s({ current: v })} />
              <Field label="Start">
                <Input type="month" value={e.start} onChange={(v) => s({ start: v.target.value })} />
              </Field>
              {!e.current ? (
                <Field label="End">
                  <Input type="month" value={e.end} onChange={(v) => s({ end: v.target.value })} />
                </Field>
              ) : null}
            </div>
            <Textarea rows={2} placeholder="Description (optional)" aria-label="Description" value={e.description} onChange={(v) => s({ description: v.target.value })} />
            <Textarea rows={2} placeholder="Achievements / coursework — one per line" aria-label="Achievements" value={e.achievements} onChange={(v) => s({ achievements: v.target.value })} />
          </div>
        )}
      />

      <ListEditor
        title="Projects"
        addLabel="Add"
        items={cv.projects}
        onChange={(projects) => set({ projects })}
        make={newProject}
        itemLabel={(e) => e.name}
        render={(e, s) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Project name" aria-label="Project name" value={e.name} onChange={(v) => s({ name: v.target.value })} />
              <Input placeholder="Type (e.g. Personal project)" aria-label="Project type" value={e.type} onChange={(v) => s({ type: v.target.value })} />
              <Input placeholder="Technologies" aria-label="Technologies" value={e.technologies} onChange={(v) => s({ technologies: v.target.value })} />
              <Input placeholder="Link" aria-label="Project link" value={e.link} onChange={(v) => s({ link: v.target.value })} />
              <Field label="Start">
                <Input type="month" value={e.start} onChange={(v) => s({ start: v.target.value })} />
              </Field>
              <Field label="End">
                <Input type="month" value={e.end} onChange={(v) => s({ end: v.target.value })} />
              </Field>
            </div>
            <Textarea rows={3} placeholder="What it does and key results — one bullet per line" aria-label="Project description" value={e.description} onChange={(v) => s({ description: v.target.value })} />
          </div>
        )}
      />

      <ListEditor
        title="Experience"
        addLabel="Add"
        items={cv.experience}
        onChange={(experience) => set({ experience })}
        make={newExperience}
        itemLabel={(e) => e.role || e.company}
        render={(e, s) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Role" aria-label="Role" value={e.role} onChange={(v) => s({ role: v.target.value })} />
              <Input placeholder="Company / organisation" aria-label="Company" value={e.company} onChange={(v) => s({ company: v.target.value })} />
              <Input placeholder="Location" aria-label="Location" value={e.location} onChange={(v) => s({ location: v.target.value })} />
              <Check label="Currently working here" checked={e.current} onChange={(v) => s({ current: v })} />
              <Field label="Start">
                <Input type="month" value={e.start} onChange={(v) => s({ start: v.target.value })} />
              </Field>
              {!e.current ? (
                <Field label="End">
                  <Input type="month" value={e.end} onChange={(v) => s({ end: v.target.value })} />
                </Field>
              ) : null}
            </div>
            <Textarea rows={2} placeholder="Short description (optional)" aria-label="Description" value={e.description} onChange={(v) => s({ description: v.target.value })} />
            <Textarea rows={3} placeholder="Bullet points — one per line" aria-label="Bullet points" value={e.bullets} onChange={(v) => s({ bullets: v.target.value })} />
          </div>
        )}
      />

      <ListEditor
        title="Certifications"
        addLabel="Add"
        items={cv.certifications}
        onChange={(certifications) => set({ certifications })}
        make={newCertification}
        itemLabel={(e) => e.name}
        render={(e, s) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="Certificate name" aria-label="Certificate name" value={e.name} onChange={(v) => s({ name: v.target.value })} />
            <Input placeholder="Issuing organisation" aria-label="Issuer" value={e.issuer} onChange={(v) => s({ issuer: v.target.value })} />
            <Field label="Date">
              <Input type="month" value={e.date} onChange={(v) => s({ date: v.target.value })} />
            </Field>
            <Field label="Credential link">
              <Input value={e.link} onChange={(v) => s({ link: v.target.value })} />
            </Field>
          </div>
        )}
      />

      <ListEditor
        title="Achievements"
        addLabel="Add"
        items={cv.achievements}
        onChange={(achievements) => set({ achievements })}
        make={newAchievement}
        itemLabel={(e) => e.title}
        render={(e, s) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
              <Input placeholder="Achievement" aria-label="Achievement title" value={e.title} onChange={(v) => s({ title: v.target.value })} />
              <Input type="month" aria-label="Date" value={e.date} onChange={(v) => s({ date: v.target.value })} />
            </div>
            <Textarea rows={2} placeholder="Description (optional)" aria-label="Description" value={e.description} onChange={(v) => s({ description: v.target.value })} />
          </div>
        )}
      />

      <ListEditor
        title="Creative work"
        addLabel="Add"
        items={cv.creative}
        onChange={(creative) => set({ creative })}
        make={newCreative}
        itemLabel={(e) => e.title}
        render={(e, s) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input placeholder="Title" aria-label="Title" value={e.title} onChange={(v) => s({ title: v.target.value })} />
              <Input placeholder="Type (e.g. Article)" aria-label="Type" value={e.type} onChange={(v) => s({ type: v.target.value })} />
              <Input placeholder="Link" aria-label="Link" value={e.link} onChange={(v) => s({ link: v.target.value })} />
            </div>
            <Textarea rows={2} placeholder="Description" aria-label="Description" value={e.description} onChange={(v) => s({ description: v.target.value })} />
          </div>
        )}
      />

      <Panel>
        <PanelHeading title="Skills & languages" />
        <div className="mt-4 space-y-3">
          {cv.skills.map((sk) => (
            <div key={sk.id} className="grid grid-cols-[minmax(0,1fr)_140px_auto] gap-2">
              <Input
                placeholder="Skill"
                aria-label="Skill"
                value={sk.name}
                onChange={(e) => set({ skills: cv.skills.map((x) => (x.id === sk.id ? { ...x, name: e.target.value } : x)) })}
              />
              <Input
                placeholder="Category"
                aria-label="Skill category"
                value={sk.category}
                onChange={(e) => set({ skills: cv.skills.map((x) => (x.id === sk.id ? { ...x, category: e.target.value } : x)) })}
              />
              <Button variant="ghost" size="icon" aria-label="Remove skill" onClick={() => set({ skills: cv.skills.filter((x) => x.id !== sk.id) })}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" onClick={() => set({ skills: [...cv.skills, { id: uid(), name: "", category: "" }] })}>
            <Plus className="size-4" /> Add skill
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Languages</p>
          {cv.languages.map((l) => (
            <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_160px_auto] gap-2">
              <Input
                placeholder="Language"
                aria-label="Language"
                value={l.name}
                onChange={(e) => set({ languages: cv.languages.map((x) => (x.id === l.id ? { ...x, name: e.target.value } : x)) })}
              />
              <Select
                aria-label="Proficiency"
                value={l.level}
                onChange={(e) => set({ languages: cv.languages.map((x) => (x.id === l.id ? { ...x, level: e.target.value } : x)) })}
              >
                <option value="">Proficiency</option>
                {["Native", "Fluent", "Professional", "Intermediate", "Basic"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
              <Button variant="ghost" size="icon" aria-label="Remove language" onClick={() => set({ languages: cv.languages.filter((x) => x.id !== l.id) })}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" onClick={() => set({ languages: [...cv.languages, { id: uid(), name: "", level: "" }] })}>
            <Plus className="size-4" /> Add language
          </Button>
        </div>
      </Panel>

      <Panel>
        <PanelHeading title="More" />
        <div className="mt-4 space-y-5">
          <TagEditor label="Technical tools" values={cv.tools} onChange={(tools) => set({ tools })} placeholder="e.g. Git, Figma — press Enter" />
          <TagEditor label="Additional skills" values={cv.additionalSkills} onChange={(additionalSkills) => set({ additionalSkills })} placeholder="e.g. Public speaking" />
          <TagEditor label="Career interests" values={cv.interests} onChange={(interests) => set({ interests })} placeholder="e.g. Research, EdTech" />
          <Field label="Quote (optional)">
            <Input value={cv.quote} maxLength={160} onChange={(e) => set({ quote: e.target.value })} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
