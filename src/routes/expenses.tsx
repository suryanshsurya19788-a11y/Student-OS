import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
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
  ProgressBar,
  SampleFlag,
  Select,
  Tabs,
} from "@/components/ui-kit";
import { Donut, BarChart } from "@/components/ui-kit/Charts";
import { ConfirmDialog } from "@/components/ui-kit/Modal";
import { useStore } from "@/store/app-store";
import { uid } from "@/lib/sampleData";
import { addDays, formatDate, isValidISODate, monthKey, todayISO } from "@/lib/date";
import {
  EXPENSE_CATEGORIES,
  SUBJECT_COLORS,
  type ExpenseCategory,
  type Transaction,
} from "@/lib/types";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — StudentOS" },
      {
        name: "description",
        content: "Track student spending and income by category against a monthly budget.",
      },
      { property: "og:title", content: "Expenses — StudentOS" },
      {
        property: "og:description",
        content: "Category spending, income and monthly budget tracking, all stored locally.",
      },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { data, update, setSettings } = useStore();
  const cur = data.settings.currency;
  const today = todayISO();
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState({
    type: "expense" as "expense" | "income",
    amount: "",
    category: "Food" as ExpenseCategory,
    note: "",
    date: today,
  });

  const mk = monthKey(today);
  const monthTx = data.transactions.filter((t) => t.date.startsWith(mk));
  const spent = monthTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const income = monthTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const balance = data.transactions.reduce(
    (a, t) => a + (t.type === "income" ? t.amount : -t.amount),
    0,
  );
  const budget = data.settings.monthlyBudget;
  const budgetPct = budget > 0 ? (spent / budget) * 100 : 0;

  const slices = useMemo(
    () =>
      EXPENSE_CATEGORIES.map((c, i) => ({
        label: c,
        value: monthTx
          .filter((t) => t.type === "expense" && t.category === c)
          .reduce((a, t) => a + t.amount, 0),
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] as string,
      })).filter((s) => s.value > 0),
    [monthTx],
  );

  const bars = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const iso = addDays(today, -i);
      out.push({
        label: iso.slice(8),
        value: data.transactions
          .filter((t) => t.type === "expense" && t.date === iso)
          .reduce((a, t) => a + t.amount, 0),
      });
    }
    return out;
  }, [data.transactions, today]);

  const visible = data.transactions
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  function add() {
    const e: Record<string, string> = {};
    const amt = Number(draft.amount);
    if (!Number.isFinite(amt) || amt <= 0) e["amount"] = "Enter an amount above zero.";
    if (amt > 1_000_000) e["amount"] = "That's too large.";
    if (!isValidISODate(draft.date)) e["date"] = "Pick a valid date.";
    if (draft.note.length > 80) e["note"] = "Keep the note short.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const tx: Transaction = {
      id: uid(),
      type: draft.type,
      amount: Math.round(amt * 100) / 100,
      category: draft.category,
      note: draft.note.trim(),
      date: draft.date,
    };
    update((d) => ({ ...d, transactions: [tx, ...d.transactions] }));
    setDraft({ ...draft, amount: "", note: "" });
    toast.success(draft.type === "income" ? "Income logged" : "Expense logged");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Expenses"
        title="Where the money actually goes"
        description="Log spending and income, then watch the monthly budget."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Panel delay={40}>
          <p className="text-[11px] uppercase tracking-[0.14em] text-mute">Spent this month</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
            {cur}
            {spent.toFixed(2)}
          </p>
        </Panel>
        <Panel delay={70}>
          <p className="text-[11px] uppercase tracking-[0.14em] text-mute">Income</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-success">
            {cur}
            {income.toFixed(2)}
          </p>
        </Panel>
        <Panel delay={100}>
          <p className="text-[11px] uppercase tracking-[0.14em] text-mute">Net balance</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
            {cur}
            {balance.toFixed(2)}
          </p>
        </Panel>
        <Panel delay={130} accent>
          <p className="text-[11px] uppercase tracking-[0.14em] text-mute">Budget used</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
            {Math.round(budgetPct)}%
          </p>
          <ProgressBar
            value={budgetPct}
            className="mt-3"
            {...(budgetPct > 100 ? { color: "var(--destructive)" } : {})}
          />
        </Panel>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel delay={160}>
            <PanelHeading title="Log a transaction" />
            <div className="mt-4 space-y-4">
              <Field label="Type">
                <Select
                  value={draft.type}
                  onChange={(e) =>
                    setDraft({ ...draft, type: e.target.value as "expense" | "income" })
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Select>
              </Field>
              <Field label={`Amount (${cur})`} {...(errors["amount"] ? { error: errors["amount"] } : {})}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                  placeholder="12.50"
                />
              </Field>
              <Field label="Category">
                <Select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value as ExpenseCategory })
                  }
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Note" {...(errors["note"] ? { error: errors["note"] } : {})}>
                <Input
                  value={draft.note}
                  maxLength={80}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  placeholder="Campus canteen"
                />
              </Field>
              <Field label="Date" {...(errors["date"] ? { error: errors["date"] } : {})}>
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </Field>
              <Button variant="primary" className="w-full" onClick={add}>
                <Plus className="size-4" /> Add transaction
              </Button>
            </div>
          </Panel>

          <Panel delay={200}>
            <PanelHeading title="Monthly budget" />
            <div className="mt-4">
              <Field label={`Budget (${cur})`}>
                <Input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setSettings({ monthlyBudget: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <p className="mt-3 text-xs text-mute">
              {budgetPct > 100
                ? `Over budget by ${cur}${(spent - budget).toFixed(2)}.`
                : `${cur}${(budget - spent).toFixed(2)} left for the month.`}
            </p>
          </Panel>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel delay={180}>
              <PanelHeading title="By category" hint="This month" />
              <div className="mt-4 flex items-center gap-5">
                <Donut
                  slices={slices}
                  centerLabel={`${cur}${spent.toFixed(0)}`}
                  centerSub="spent"
                />
                <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                  {slices.length === 0 ? (
                    <p className="text-mute">No spending yet this month.</p>
                  ) : (
                    slices.map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-sm"
                          style={{ background: s.color }}
                        />
                        <span className="min-w-0 flex-1 truncate">{s.label}</span>
                        <span className="shrink-0 tabular-nums text-mute">
                          {cur}
                          {s.value.toFixed(0)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Panel>

            <Panel delay={210}>
              <PanelHeading title="Daily spend" hint="Last 14 days" />
              <div className="mt-4">
                <BarChart bars={bars} unit={cur} />
              </div>
            </Panel>
          </div>

          <Panel delay={240}>
            <PanelHeading
              title="Transactions"
              action={
                <Tabs
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "expense", label: "Out" },
                    { value: "income", label: "In" },
                  ]}
                />
              }
            />
            {visible.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={<Wallet className="size-5" />}
                  title="Nothing logged yet"
                  description="Add your first transaction on the left."
                />
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {visible.slice(0, 60).map((t) => (
                  <li
                    key={t.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-medium">{t.note || t.category}</p>
                        {t.sample ? <SampleFlag /> : null}
                      </div>
                      <p className="text-[11px] text-mute">
                        {formatDate(t.date)} · {t.category}
                      </p>
                    </div>
                    <Badge tone={t.type === "income" ? "success" : "neutral"}>
                      {t.type === "income" ? "+" : "−"}
                      {cur}
                      {t.amount.toFixed(2)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete transaction"
                      onClick={() => setToDelete(t)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          update((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== toDelete.id) }))
        }
        title="Delete this transaction?"
        message="It will be removed from your records on this device."
      />
    </div>
  );
}
