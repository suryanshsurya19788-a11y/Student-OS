import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, Link2, QrCode as QrIcon } from "lucide-react";
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

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "QR & Link Tools — StudentOS" },
      {
        name: "description",
        content: "Generate QR codes, encode URLs and inspect link parts entirely in your browser.",
      },
      { property: "og:title", content: "QR & Link Tools — StudentOS" },
      {
        property: "og:description",
        content: "Offline QR code generation, URL encoding and link inspection.",
      },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const [tab, setTab] = useState<"qr" | "encode" | "inspect">("qr");
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="QR & link tools"
        title="Share things without a middleman"
        description="QR codes are drawn locally — nothing is uploaded to generate them."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "qr", label: "QR generator" },
          { value: "encode", label: "URL encoder" },
          { value: "inspect", label: "Link inspector" },
        ]}
        className="max-w-lg"
      />
      {tab === "qr" ? <QrGen /> : tab === "encode" ? <Encoder /> : <Inspector />}
    </div>
  );
}

function QrGen() {
  const [text, setText] = useState("https://example.edu/my-notes");
  const [size, setSize] = useState("320");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const value = text.trim();
    if (!value) {
      setDataUrl("");
      setError("Enter some text or a link.");
      return;
    }
    if (value.length > 1200) {
      setDataUrl("");
      setError("That's too much data for one QR code.");
      return;
    }
    setError("");
    QRCode.toDataURL(value, {
      width: Number(size) || 320,
      margin: 2,
      errorCorrectionLevel: level,
      color: { dark: "#0b1020", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't draw a QR code for that value.");
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, level]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "studentos-qr.png";
    a.click();
    toast.success("QR code downloaded");
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Panel delay={60}>
        <PanelHeading title="Content" />
        <div className="mt-4 space-y-4">
          <Field label="Text or URL" {...(error ? { error } : {})}>
            <Textarea
              rows={5}
              value={text}
              maxLength={1200}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://…, wifi details, a note to a classmate"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Size (px)">
              <Select value={size} onChange={(e) => setSize(e.target.value)}>
                {["200", "320", "480", "640"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Error correction" hint="Higher survives more damage.">
              <Select
                value={level}
                onChange={(e) => setLevel(e.target.value as "L" | "M" | "Q" | "H")}
              >
                <option value="L">Low</option>
                <option value="M">Medium</option>
                <option value="Q">Quartile</option>
                <option value="H">High</option>
              </Select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            {["https://", "mailto:", "tel:", "WIFI:S:;T:WPA;P:;;"].map((p) => (
              <Button key={p} size="sm" onClick={() => setText(p)}>
                {p}
              </Button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel accent delay={100} className="flex flex-col items-center">
        <PanelHeading title="Preview" />
        <div className="mt-4 grid w-full place-items-center rounded-2xl bg-white p-4">
          {dataUrl ? (
            <img src={dataUrl} alt="Generated QR code" className="h-auto w-full max-w-[280px]" />
          ) : (
            <div className="grid h-[240px] w-full place-items-center text-xs text-[#0b1020]/50">
              <QrIcon className="size-8" />
            </div>
          )}
        </div>
        <Button variant="primary" className="mt-4 w-full" onClick={download} disabled={!dataUrl}>
          <Download className="size-4" /> Download PNG
        </Button>
      </Panel>
    </div>
  );
}

function Encoder() {
  const [raw, setRaw] = useState("search query with spaces & symbols");

  const encoded = useMemo(() => {
    try {
      return encodeURIComponent(raw);
    } catch {
      return "";
    }
  }, [raw]);

  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return "Not a valid encoded string.";
    }
  }, [raw]);

  async function copy(v: string) {
    try {
      await navigator.clipboard.writeText(v);
      toast.success("Copied");
    } catch {
      toast.error("Your browser blocked clipboard access");
    }
  }

  return (
    <div className="space-y-4">
      <Panel delay={60}>
        <PanelHeading title="Input" />
        <div className="mt-4">
          <Textarea rows={4} value={raw} onChange={(e) => setRaw(e.target.value)} />
        </div>
      </Panel>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel delay={90}>
          <PanelHeading
            title="Encoded"
            action={
              <Button size="sm" variant="ghost" onClick={() => copy(encoded)}>
                <Copy className="size-3.5" /> Copy
              </Button>
            }
          />
          <pre className="scrollbar-slim mt-3 max-h-40 overflow-auto rounded-xl veil p-3 text-[12px] ring-1 ring-line">
            <code className="font-mono break-all">{encoded}</code>
          </pre>
        </Panel>
        <Panel delay={120}>
          <PanelHeading
            title="Decoded"
            action={
              <Button size="sm" variant="ghost" onClick={() => copy(decoded)}>
                <Copy className="size-3.5" /> Copy
              </Button>
            }
          />
          <pre className="scrollbar-slim mt-3 max-h-40 overflow-auto rounded-xl veil p-3 text-[12px] ring-1 ring-line">
            <code className="font-mono break-all">{decoded}</code>
          </pre>
        </Panel>
      </div>
    </div>
  );
}

function Inspector() {
  const [value, setValue] = useState("https://library.example.edu/search?q=algorithms&page=2#results");

  const parsed = useMemo(() => {
    try {
      const u = new URL(value.trim());
      return { ok: true as const, u };
    } catch {
      return { ok: false as const };
    }
  }, [value]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Panel delay={60}>
        <PanelHeading title="Link" />
        <div className="mt-4">
          <Field
            label="URL"
            {...(parsed.ok ? {} : { error: "That isn't a complete URL — include https://" })}
          >
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
        </div>
        {parsed.ok ? (
          <dl className="mt-5 space-y-2 text-[13px]">
            {[
              ["Protocol", parsed.u.protocol],
              ["Host", parsed.u.host],
              ["Path", parsed.u.pathname],
              ["Hash", parsed.u.hash || "—"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <dt className="text-mute">{k}</dt>
                <dd className="min-w-0 break-all font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Panel>

      <Panel delay={100}>
        <PanelHeading title="Query parameters" />
        {parsed.ok ? (
          Array.from(parsed.u.searchParams.entries()).length === 0 ? (
            <p className="mt-3 text-sm text-mute">No query parameters.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {Array.from(parsed.u.searchParams.entries()).map(([k, v]) => (
                <li key={k} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2">
                  <span className="min-w-0 truncate text-[13px] font-medium">{k}</span>
                  <Badge>{v}</Badge>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="mt-3 flex items-center gap-2 text-sm text-mute">
            <Link2 className="size-4" /> Enter a valid URL to inspect it.
          </p>
        )}
      </Panel>
    </div>
  );
}
