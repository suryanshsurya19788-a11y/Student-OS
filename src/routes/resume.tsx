import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Download, FilePlus2, Printer, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Input, PageHeader, Panel, Select, Tabs } from "@/components/ui-kit";
import { ConfirmDialog } from "@/components/ui-kit/Modal";
import { CvPaper } from "@/components/resume/CvPaper";
import { CvEditor } from "@/components/resume/CvEditor";
import { useStore } from "@/store/app-store";
import { uid } from "@/lib/sampleData";
import {
  CV_ACCENTS,
  CV_TEMPLATES,
  emptyCv,
  exampleCv,
  normalizeCv,
  type CvAccent,
  type CvData,
} from "@/lib/cv";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume Builder — StudentOS" },
      {
        name: "description",
        content: "Build a polished A4 resume with templates, live preview and PDF export — offline.",
      },
      { property: "og:title", content: "Resume Builder — StudentOS" },
      {
        property: "og:description",
        content: "Templates, accent colours, photo, live A4 preview and print-ready PDF.",
      },
    ],
  }),
  component: ResumePage,
});

const PAPER_PX = 794; // 210mm at 96dpi

function ResumePage() {
  const { data, ready, update } = useStore();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [confirm, setConfirm] = useState<null | "reset" | "delete" | "example">(null);

  const cvs = useMemo(() => (data.cvs ?? []).map(normalizeCv), [data.cvs]);
  const cv = cvs.find((c) => c.id === data.activeCvId) ?? cvs[0];

  // First visit: start with a blank resume (never dummy data).
  useEffect(() => {
    if (ready && cvs.length === 0) {
      const first = emptyCv();
      update((d) => ({ ...d, cvs: [first], activeCvId: first.id }));
    }
  }, [ready, cvs.length, update]);

  const updateCv = useCallback(
    (fn: (c: CvData) => CvData) => {
      if (!cv) return;
      update((d) => ({
        ...d,
        cvs: (d.cvs ?? []).map((c) =>
          c.id === cv.id ? { ...fn(normalizeCv(c)), updatedAt: new Date().toISOString() } : c,
        ),
      }));
    },
    [cv, update],
  );

  function addCv(next: CvData) {
    update((d) => ({ ...d, cvs: [...(d.cvs ?? []), next], activeCvId: next.id }));
  }

  function print(asPdf: boolean) {
    if (!cv) return;
    const prevTitle = document.title;
    if (asPdf) {
      document.title = `${cv.personal.name.trim() || "Resume"} - Resume`;
      toast.message("Choose “Save as PDF” as the destination", {
        description: "Set paper size to A4 and margins to None for the best result.",
      });
    }
    document.body.classList.add("cv-printing");
    const done = () => {
      document.body.classList.remove("cv-printing");
      document.title = prevTitle;
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), asPdf ? 300 : 0);
  }

  if (!cv) {
    return <div className="h-96 animate-pulse rounded-2xl veil" />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Resume builder"
        title="One page that opens doors"
        description="Changes save automatically on this device."
        actions={
          <>
            <Button onClick={() => print(false)}>
              <Printer className="size-4" /> Print
            </Button>
            <Button variant="primary" onClick={() => print(true)}>
              <Download className="size-4" /> Download PDF
            </Button>
          </>
        }
      />

      {/* Document controls */}
      <Panel delay={40}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Resume">
              <Select value={cv.id} onChange={(e) => update((d) => ({ ...d, activeCvId: e.target.value }))}>
                {cvs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || "Untitled"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Name this version">
              <Input value={cv.label} maxLength={40} onChange={(e) => updateCv((c) => ({ ...c, label: e.target.value }))} />
            </Field>
          </div>
          <div className="flex flex-wrap items-end gap-2 lg:justify-end">
            <Button size="sm" onClick={() => addCv(emptyCv(`Resume ${cvs.length + 1}`))}>
              <FilePlus2 className="size-4" /> New
            </Button>
            <Button size="sm" onClick={() => addCv({ ...cv, id: uid(), label: `${cv.label} (copy)` })}>
              <Copy className="size-4" /> Duplicate
            </Button>
            <Button size="sm" onClick={() => setConfirm("example")}>
              <Sparkles className="size-4" /> Fill with example
            </Button>
            <Button size="sm" onClick={() => setConfirm("reset")}>
              <RotateCcw className="size-4" /> Reset
            </Button>
            {cvs.length > 1 ? (
              <Button size="sm" variant="ghost" onClick={() => setConfirm("delete")} aria-label="Delete this resume">
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Template</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CV_TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  aria-pressed={cv.template === t.value}
                  onClick={() => updateCv((c) => ({ ...c, template: t.value }))}
                  className={`rounded-xl p-3 text-left ring-1 transition-colors ${
                    cv.template === t.value ? "bg-primary/10 ring-primary" : "veil-soft ring-line hover:ring-primary/40"
                  }`}
                >
                  <p className="text-[13px] font-semibold">{t.label}</p>
                  <p className="mt-0.5 text-[11px] text-mute">{t.hint}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Accent</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CV_ACCENTS) as CvAccent[]).map((a) => (
                <button
                  key={a}
                  aria-pressed={cv.accent === a}
                  aria-label={`${CV_ACCENTS[a].label} accent`}
                  title={CV_ACCENTS[a].label}
                  onClick={() => updateCv((c) => ({ ...c, accent: a }))}
                  className={`size-9 rounded-full ring-2 ring-offset-2 ring-offset-[var(--background)] transition-transform hover:scale-105 ${
                    cv.accent === a ? "ring-ink" : "ring-transparent"
                  }`}
                  style={{ background: CV_ACCENTS[a].ink }}
                />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Tabs
        value={view}
        onChange={setView}
        options={[
          { value: "edit", label: "Edit" },
          { value: "preview", label: "Preview" },
        ]}
        className="max-w-xs xl:hidden"
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={`${view === "preview" ? "hidden" : ""} xl:block`}>
          <CvEditor cv={cv} update={updateCv} />
        </div>
        <div className={`${view === "edit" ? "hidden" : ""} xl:block`}>
          <div className="xl:sticky xl:top-4">
            <ScaledPreview cv={cv} />
            <p className="mt-2 text-center text-[11px] text-mute">A4 preview · empty sections are hidden automatically</p>
          </div>
        </div>
      </div>

      {/* Hidden print copy, rendered at real size outside the app shell */}
      {typeof document !== "undefined"
        ? createPortal(
            <div className="cv-print-root">
              <CvPaper cv={cv} />
            </div>,
            document.body,
          )
        : null}

      <ConfirmDialog
        open={confirm === "reset"}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          updateCv((c) => ({ ...emptyCv(c.label), id: c.id }));
          toast.success("Resume cleared");
        }}
        title="Reset this resume?"
        message="Every field in this resume will be cleared. Other saved resumes are not affected."
        confirmLabel="Reset"
      />
      <ConfirmDialog
        open={confirm === "example"}
        onClose={() => setConfirm(null)}
        onConfirm={() => updateCv((c) => ({ ...exampleCv(), id: c.id, label: c.label }))}
        title="Fill with example content?"
        message="This replaces what's in this resume with a made-up example so you can see the layout. Use Duplicate first to keep your version."
        confirmLabel="Fill with example"
        danger={false}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() =>
          update((d) => {
            const rest = (d.cvs ?? []).filter((c) => c.id !== cv.id);
            return { ...d, cvs: rest, activeCvId: rest[0]?.id ?? "" };
          })
        }
        title="Delete this resume?"
        message={`"${cv.label}" will be removed from this device.`}
      />
    </div>
  );
}

/** Renders the real-size A4 page and scales it down to fit its column. */
function ScaledPreview({ cv }: { cv: CvData }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [height, setHeight] = useState(1123);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const page = pageRef.current;
    if (!box || !page) return;
    const measure = () => {
      setScale(Math.min(1, box.clientWidth / PAPER_PX));
      setHeight(page.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(page);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="w-full overflow-hidden rounded-xl shadow-2xl" style={{ height: height * scale }}>
      <div ref={pageRef} style={{ width: PAPER_PX, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <CvPaper cv={cv} />
      </div>
    </div>
  );
}
