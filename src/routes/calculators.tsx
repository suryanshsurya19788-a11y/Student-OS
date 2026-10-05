import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Field,
  Input,
  PageHeader,
  Panel,
  PanelHeading,
  ProgressBar,
  Select,
  Tabs,
} from "@/components/ui-kit";

export const Route = createFileRoute("/calculators")({
  head: () => ({
    meta: [
      { title: "Calculators — StudentOS" },
      {
        name: "description",
        content: "GPA, weighted grades, percentages, unit conversion and split-the-bill maths.",
      },
      { property: "og:title", content: "Calculators — StudentOS" },
      {
        property: "og:description",
        content: "GPA, grade targets, percentages, unit conversion and bill splitting.",
      },
    ],
  }),
  component: CalculatorsPage,
});

type Tab = "gpa" | "grade" | "percent" | "units" | "split";

function CalculatorsPage() {
  const [tab, setTab] = useState<Tab>("gpa");
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Calculators"
        title="The maths you keep redoing"
        description="Everything runs in your browser — nothing is sent anywhere."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "gpa", label: "GPA" },
          { value: "grade", label: "Grade target" },
          { value: "percent", label: "Percentage" },
          { value: "units", label: "Units" },
          { value: "split", label: "Split bill" },
        ]}
        className="max-w-2xl"
      />
      {tab === "gpa" ? <GpaCalc /> : null}
      {tab === "grade" ? <GradeCalc /> : null}
      {tab === "percent" ? <PercentCalc /> : null}
      {tab === "units" ? <UnitCalc /> : null}
      {tab === "split" ? <SplitCalc /> : null}
    </div>
  );
}

/* --------------------------------- GPA ---------------------------------- */

const GRADE_POINTS: Record<string, number> = {
  "A+": 4, A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7,
  "C+": 2.3, C: 2, "C-": 1.7, "D+": 1.3, D: 1, F: 0,
};

interface Course {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

let cid = 1;

function GpaCalc() {
  const [rows, setRows] = useState<Course[]>([
    { id: cid++, name: "Calculus II", credits: "4", grade: "A-" },
    { id: cid++, name: "Data Structures", credits: "3", grade: "B+" },
    { id: cid++, name: "Microeconomics", credits: "3", grade: "A" },
  ]);

  const { gpa, credits } = useMemo(() => {
    let pts = 0;
    let cr = 0;
    for (const r of rows) {
      const c = Number(r.credits);
      if (!Number.isFinite(c) || c <= 0) continue;
      pts += c * (GRADE_POINTS[r.grade] ?? 0);
      cr += c;
    }
    return { gpa: cr ? pts / cr : 0, credits: cr };
  }, [rows]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Panel delay={60}>
        <PanelHeading
          title="Courses"
          action={
            <Button
              size="sm"
              onClick={() => setRows([...rows, { id: cid++, name: "", credits: "3", grade: "A" }])}
            >
              <Plus className="size-4" /> Add
            </Button>
          }
        />
        <div className="mt-4 space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[minmax(0,1fr)_80px_90px_auto] items-center gap-2"
            >
              <Input
                value={r.name}
                placeholder="Course name"
                aria-label="Course name"
                onChange={(e) =>
                  setRows(rows.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))
                }
              />
              <Input
                type="number"
                min={0}
                max={12}
                value={r.credits}
                aria-label="Credits"
                onChange={(e) =>
                  setRows(rows.map((x) => (x.id === r.id ? { ...x, credits: e.target.value } : x)))
                }
              />
              <Select
                value={r.grade}
                aria-label="Grade"
                onChange={(e) =>
                  setRows(rows.map((x) => (x.id === r.id ? { ...x, grade: e.target.value } : x)))
                }
              >
                {Object.keys(GRADE_POINTS).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove course"
                onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-mute">Add a course to get started.</p>
          ) : null}
        </div>
      </Panel>

      <Panel accent delay={100}>
        <PanelHeading title="Result" />
        <p className="mt-4 font-display text-6xl font-semibold tabular-nums">{gpa.toFixed(2)}</p>
        <p className="mt-1 text-xs text-mute">on a 4.0 scale · {credits} credits</p>
        <div className="mt-4">
          <ProgressBar value={(gpa / 4) * 100} />
        </div>
        <p className="mt-4 text-xs text-mute">
          Weighted by credit hours: each course counts in proportion to its credits.
        </p>
      </Panel>
    </div>
  );
}

/* ----------------------------- Grade target ------------------------------ */

function GradeCalc() {
  const [current, setCurrent] = useState("78");
  const [weightDone, setWeightDone] = useState("70");
  const [target, setTarget] = useState("85");

  const cur = Number(current);
  const wd = Number(weightDone);
  const tg = Number(target);
  const remaining = 100 - wd;
  const needed = remaining > 0 ? (tg - (cur * wd) / 100) / (remaining / 100) : NaN;
  const valid = [cur, wd, tg].every((n) => Number.isFinite(n)) && wd >= 0 && wd < 100;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Panel delay={60}>
        <PanelHeading title="What do I need on the final?" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Current grade %">
            <Input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="% of course graded">
            <Input type="number" value={weightDone} onChange={(e) => setWeightDone(e.target.value)} />
          </Field>
          <Field label="Target grade %">
            <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
        </div>
        <p className="mt-4 text-xs text-mute">
          The remaining {Number.isFinite(remaining) ? remaining : 0}% of your grade is still up for
          grabs.
        </p>
      </Panel>
      <Panel accent delay={100}>
        <PanelHeading title="You need" />
        {!valid ? (
          <p className="mt-4 text-sm text-destructive">Enter valid numbers (graded % under 100).</p>
        ) : (
          <>
            <p className="mt-4 font-display text-6xl font-semibold tabular-nums">
              {needed.toFixed(1)}
              <span className="text-2xl text-mute">%</span>
            </p>
            <p className="mt-2 text-xs text-mute">
              {needed > 100
                ? "That target isn't reachable with the remaining weight."
                : needed <= 0
                  ? "You've already secured it."
                  : "on the remaining assessments."}
            </p>
          </>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------ Percentage ------------------------------- */

function PercentCalc() {
  const [a, setA] = useState("25");
  const [b, setB] = useState("180");
  const [x, setX] = useState("45");
  const [y, setY] = useState("60");
  const [from, setFrom] = useState("120");
  const [to, setTo] = useState("150");

  const r1 = (Number(a) / 100) * Number(b);
  const r2 = (Number(x) / Number(y)) * 100;
  const r3 = ((Number(to) - Number(from)) / Number(from)) * 100;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Panel delay={60}>
        <PanelHeading title="X% of Y" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="Percent">
            <Input type="number" value={a} onChange={(e) => setA(e.target.value)} />
          </Field>
          <Field label="Of">
            <Input type="number" value={b} onChange={(e) => setB(e.target.value)} />
          </Field>
        </div>
        <p className="mt-4 font-display text-3xl font-semibold tabular-nums">
          {Number.isFinite(r1) ? r1.toFixed(2) : "—"}
        </p>
      </Panel>
      <Panel delay={90}>
        <PanelHeading title="X is what % of Y" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="Value">
            <Input type="number" value={x} onChange={(e) => setX(e.target.value)} />
          </Field>
          <Field label="Total">
            <Input type="number" value={y} onChange={(e) => setY(e.target.value)} />
          </Field>
        </div>
        <p className="mt-4 font-display text-3xl font-semibold tabular-nums">
          {Number.isFinite(r2) ? `${r2.toFixed(2)}%` : "—"}
        </p>
      </Panel>
      <Panel delay={120}>
        <PanelHeading title="Percent change" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="From">
            <Input type="number" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <Input type="number" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        <p className="mt-4 font-display text-3xl font-semibold tabular-nums">
          {Number.isFinite(r3) ? `${r3 > 0 ? "+" : ""}${r3.toFixed(2)}%` : "—"}
        </p>
      </Panel>
    </div>
  );
}

/* --------------------------------- Units --------------------------------- */

const UNITS: Record<string, Record<string, number>> = {
  Length: { Metres: 1, Kilometres: 1000, Centimetres: 0.01, Inches: 0.0254, Feet: 0.3048, Miles: 1609.344 },
  Mass: { Grams: 1, Kilograms: 1000, Pounds: 453.59237, Ounces: 28.349523 },
  Volume: { Litres: 1, Millilitres: 0.001, Cups: 0.2365882, Gallons: 3.785412 },
  Data: { Megabytes: 1, Kilobytes: 0.001, Gigabytes: 1000, Terabytes: 1_000_000 },
};

function UnitCalc() {
  const [kind, setKind] = useState("Length");
  const units = Object.keys(UNITS[kind] as Record<string, number>);
  const [fromU, setFromU] = useState(units[0] as string);
  const [toU, setToU] = useState(units[1] as string);
  const [value, setValue] = useState("1");
  const [temp, setTemp] = useState("20");

  const table = UNITS[kind] as Record<string, number>;
  const base = Number(value) * (table[fromU] ?? 1);
  const out = base / (table[toU] ?? 1);

  const c = Number(temp);
  const f = (c * 9) / 5 + 32;
  const k = c + 273.15;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Panel delay={60}>
        <PanelHeading title="Unit converter" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select
              value={kind}
              onChange={(e) => {
                const k2 = e.target.value;
                const u = Object.keys(UNITS[k2] as Record<string, number>);
                setKind(k2);
                setFromU(u[0] as string);
                setToU(u[1] as string);
              }}
            >
              {Object.keys(UNITS).map((k2) => (
                <option key={k2} value={k2}>
                  {k2}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Value">
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          <Field label="From">
            <Select value={fromU} onChange={(e) => setFromU(e.target.value)}>
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field label="To">
            <Select value={toU} onChange={(e) => setToU(e.target.value)}>
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
        </div>
        <p className="mt-5 font-display text-4xl font-semibold tabular-nums">
          {Number.isFinite(out) ? out.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "—"}
          <span className="ml-2 text-base text-mute">{toU}</span>
        </p>
      </Panel>

      <Panel accent delay={100}>
        <PanelHeading title="Temperature" />
        <div className="mt-4">
          <Field label="Celsius">
            <Input type="number" value={temp} onChange={(e) => setTemp(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-mute">Fahrenheit</span>
            <span className="font-semibold tabular-nums">{Number.isFinite(f) ? f.toFixed(1) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Kelvin</span>
            <span className="font-semibold tabular-nums">{Number.isFinite(k) ? k.toFixed(2) : "—"}</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------- Split bill ------------------------------ */

function SplitCalc() {
  const [total, setTotal] = useState("64.50");
  const [people, setPeople] = useState("4");
  const [tip, setTip] = useState("10");

  const t = Number(total);
  const p = Math.max(1, Math.floor(Number(people)) || 1);
  const tp = Number(tip) || 0;
  const withTip = t * (1 + tp / 100);
  const each = withTip / p;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Panel delay={60}>
        <PanelHeading title="Split the bill" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Total">
            <Input type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
          </Field>
          <Field label="People">
            <Input type="number" min={1} value={people} onChange={(e) => setPeople(e.target.value)} />
          </Field>
          <Field label="Tip %">
            <Input type="number" value={tip} onChange={(e) => setTip(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 5, 10, 15, 20].map((v) => (
            <Button key={v} size="sm" onClick={() => setTip(String(v))}>
              {v}%
            </Button>
          ))}
        </div>
      </Panel>
      <Panel accent delay={100}>
        <PanelHeading title="Each pays" action={<Badge tone="accent2">{p} people</Badge>} />
        <p className="mt-4 font-display text-5xl font-semibold tabular-nums">
          {Number.isFinite(each) ? each.toFixed(2) : "—"}
        </p>
        <p className="mt-2 text-xs text-mute">
          Bill with tip: {Number.isFinite(withTip) ? withTip.toFixed(2) : "—"}
        </p>
      </Panel>
    </div>
  );
}
