import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, FileUp, Trash2 } from "lucide-react";
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
  Tabs,
  Textarea,
} from "@/components/ui-kit";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "File Tools — StudentOS" },
      {
        name: "description",
        content: "Inspect files, resize images, convert Base64 and count words — all in the browser.",
      },
      { property: "og:title", content: "File Tools — StudentOS" },
      {
        property: "og:description",
        content: "Local file inspection, image resizing, Base64 conversion and text statistics.",
      },
    ],
  }),
  component: FilesPage,
});

function FilesPage() {
  const [tab, setTab] = useState<"inspect" | "image" | "base64" | "text">("inspect");
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="File tools"
        title="Small jobs, no upload required"
        description="Every file you drop here is processed in your browser and never sent anywhere."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "inspect", label: "File info" },
          { value: "image", label: "Image resizer" },
          { value: "base64", label: "Base64" },
          { value: "text", label: "Text stats" },
        ]}
        className="max-w-xl"
      />
      {tab === "inspect" ? <Inspect /> : null}
      {tab === "image" ? <ImageTool /> : null}
      {tab === "base64" ? <Base64Tool /> : null}
      {tab === "text" ? <TextTool /> : null}
    </div>
  );
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function Dropzone({
  onFiles,
  accept,
  label,
  multiple,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  label: string;
  multiple?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={`grid place-items-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
        over ? "border-primary bg-primary/5" : "border-line"
      }`}
    >
      <FileUp className="size-6 text-primary" />
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-mute">Drag and drop, or choose from your device.</p>
      <Button className="mt-4" onClick={() => ref.current?.click()}>
        Choose file{multiple ? "s" : ""}
      </Button>
      <input
        ref={ref}
        type="file"
        className="sr-only"
        aria-label={label}
        {...(accept ? { accept } : {})}
        {...(multiple ? { multiple: true } : {})}
        onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
      />
    </div>
  );
}

function Inspect() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="space-y-4">
      <Panel delay={60}>
        <Dropzone multiple label="Inspect any files" onFiles={(f) => setFiles([...files, ...f])} />
      </Panel>
      {files.length > 0 ? (
        <Panel delay={90}>
          <PanelHeading
            title={`${files.length} file${files.length === 1 ? "" : "s"}`}
            action={
              <Button size="sm" variant="ghost" onClick={() => setFiles([])}>
                Clear
              </Button>
            }
          />
          <ul className="mt-3 divide-y divide-line">
            {files.map((f, i) => (
              <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{f.name}</p>
                  <p className="text-[11px] text-mute">
                    {f.type || "unknown type"} · modified{" "}
                    {new Date(f.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone="primary">{humanSize(f.size)}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}

function ImageTool() {
  const [src, setSrc] = useState("");
  const [name, setName] = useState("image");
  const [origin, setOrigin] = useState({ w: 0, h: 0, size: 0 });
  const [width, setWidth] = useState("800");
  const [quality, setQuality] = useState("0.8");
  const [out, setOut] = useState<{ url: string; size: number; w: number; h: number } | null>(null);

  function load(files: File[]) {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setSrc(url);
        setName(f.name.replace(/\.[^.]+$/, ""));
        setOrigin({ w: img.width, h: img.height, size: f.size });
        setWidth(String(Math.min(img.width, 1200)));
        setOut(null);
      };
      img.src = url;
    };
    reader.readAsDataURL(f);
  }

  function resize() {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const targetW = Math.max(16, Math.min(4000, Number(width) || img.width));
      const scale = targetW / img.width;
      const targetH = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const url = canvas.toDataURL("image/jpeg", Number(quality) || 0.8);
      const size = Math.round((url.length - url.indexOf(",") - 1) * 0.75);
      setOut({ url, size, w: targetW, h: targetH });
      toast.success("Image resized");
    };
    img.src = src;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel delay={60}>
        <PanelHeading title="Source" />
        <div className="mt-4">
          {src ? (
            <>
              <img src={src} alt="Source preview" className="max-h-64 w-full rounded-xl object-contain" />
              <p className="mt-2 text-xs text-mute">
                {origin.w}×{origin.h} · {humanSize(origin.size)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Field label="Target width (px)">
                  <Input
                    type="number"
                    min={16}
                    max={4000}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </Field>
                <Field label="JPEG quality">
                  <Select value={quality} onChange={(e) => setQuality(e.target.value)}>
                    {["0.5", "0.6", "0.7", "0.8", "0.9", "1"].map((q) => (
                      <option key={q} value={q}>
                        {Math.round(Number(q) * 100)}%
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" onClick={resize}>
                  Resize
                </Button>
                <Button onClick={() => { setSrc(""); setOut(null); }}>Clear</Button>
              </div>
            </>
          ) : (
            <Dropzone accept="image/*" label="Resize an image" onFiles={load} />
          )}
        </div>
      </Panel>

      <Panel accent delay={100}>
        <PanelHeading title="Result" />
        {out ? (
          <>
            <img src={out.url} alt="Resized result" className="mt-4 max-h-64 w-full rounded-xl object-contain" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                {out.w}×{out.h}
              </Badge>
              <Badge>{humanSize(out.size)}</Badge>
              {origin.size ? (
                <Badge tone="success">
                  {Math.max(0, Math.round((1 - out.size / origin.size) * 100))}% smaller
                </Badge>
              ) : null}
            </div>
            <Button
              variant="primary"
              className="mt-4 w-full"
              onClick={() => {
                const a = document.createElement("a");
                a.href = out.url;
                a.download = `${name}-${out.w}px.jpg`;
                a.click();
              }}
            >
              <Download className="size-4" /> Download
            </Button>
          </>
        ) : (
          <p className="mt-4 text-sm text-mute">Load an image and press Resize.</p>
        )}
      </Panel>
    </div>
  );
}

function Base64Tool() {
  const [text, setText] = useState("StudentOS keeps your data local.");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");
  const [error, setError] = useState("");

  function enc() {
    try {
      setEncoded(btoa(unescape(encodeURIComponent(text))));
      setError("");
    } catch {
      setError("Couldn't encode that text.");
    }
  }

  function dec() {
    try {
      setDecoded(decodeURIComponent(escape(atob(text.trim()))));
      setError("");
    } catch {
      setError("That isn't valid Base64.");
    }
  }

  return (
    <div className="space-y-4">
      <Panel delay={60}>
        <PanelHeading title="Input" />
        <div className="mt-4">
          <Field label="Text or Base64" {...(error ? { error } : {})}>
            <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={enc}>
              Encode
            </Button>
            <Button onClick={dec}>Decode</Button>
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel delay={90}>
          <PanelHeading title="Encoded" />
          <pre className="scrollbar-slim mt-3 max-h-48 overflow-auto rounded-xl veil p-3 text-[12px] ring-1 ring-line">
            <code className="font-mono break-all">{encoded || "—"}</code>
          </pre>
        </Panel>
        <Panel delay={120}>
          <PanelHeading title="Decoded" />
          <pre className="scrollbar-slim mt-3 max-h-48 overflow-auto rounded-xl veil p-3 text-[12px] ring-1 ring-line">
            <code className="font-mono break-all">{decoded || "—"}</code>
          </pre>
        </Panel>
      </div>
    </div>
  );
}

function TextTool() {
  const [text, setText] = useState("");

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n{2,}/).filter((s) => s.trim()).length;
  const readMin = Math.max(1, Math.round(words / 200));

  function transform(kind: "upper" | "lower" | "title" | "trim") {
    if (kind === "upper") setText(text.toUpperCase());
    if (kind === "lower") setText(text.toLowerCase());
    if (kind === "trim") setText(text.replace(/[ \t]+/g, " ").trim());
    if (kind === "title")
      setText(text.replace(/\w\S*/g, (w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()));
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Panel delay={60}>
        <PanelHeading title="Your text" />
        <div className="mt-4">
          <Textarea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an essay draft to count words and reading time."
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => transform("upper")}>
            UPPERCASE
          </Button>
          <Button size="sm" onClick={() => transform("lower")}>
            lowercase
          </Button>
          <Button size="sm" onClick={() => transform("title")}>
            Title Case
          </Button>
          <Button size="sm" onClick={() => transform("trim")}>
            Tidy spaces
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setText("")}>
            Clear
          </Button>
        </div>
      </Panel>
      <Panel accent delay={100}>
        <PanelHeading title="Stats" />
        <dl className="mt-4 space-y-3 text-sm">
          {[
            ["Words", words],
            ["Characters", chars],
            ["Sentences", sentences],
            ["Paragraphs", paragraphs],
            ["Reading time", `${readMin} min`],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex items-baseline justify-between gap-3">
              <dt className="text-mute">{k}</dt>
              <dd className="font-display text-lg font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
