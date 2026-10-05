import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChefHat, Clock, Plus, Search, Star, Trash2, Users } from "lucide-react";
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
import type { Recipe } from "@/lib/types";

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Recipes — StudentOS" },
      {
        name: "description",
        content: "A cheap-and-fast student recipe box with ingredients, steps and serving scaling.",
      },
      { property: "og:title", content: "Recipes — StudentOS" },
      {
        property: "og:description",
        content: "Student recipes with ingredients, steps and serving scaling, saved offline.",
      },
    ],
  }),
  component: RecipesPage,
});

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Drink"];
const DIFFICULTY: Recipe["difficulty"][] = ["Easy", "Medium", "Hard"];

function RecipesPage() {
  const { data, update } = useStore();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [favOnly, setFavOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(1);
  const [toDelete, setToDelete] = useState<Recipe | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState({
    title: "",
    category: "Dinner",
    minutes: "20",
    difficulty: "Easy" as Recipe["difficulty"],
    servings: "2",
    ingredients: "",
    steps: "",
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.recipes
      .filter((r) => cat === "All" || r.category === cat)
      .filter((r) => !favOnly || r.favorite)
      .filter(
        (r) =>
          !q ||
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q)),
      );
  }, [data.recipes, query, cat, favOnly]);

  function save() {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e["title"] = "Name the recipe.";
    const mins = Number(draft.minutes);
    if (!Number.isFinite(mins) || mins <= 0) e["minutes"] = "How many minutes?";
    const srv = Number(draft.servings);
    if (!Number.isFinite(srv) || srv <= 0) e["servings"] = "At least one serving.";
    const ingredients = draft.ingredients.split("\n").map((s) => s.trim()).filter(Boolean);
    if (ingredients.length === 0) e["ingredients"] = "List at least one ingredient.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const recipe: Recipe = {
      id: uid(),
      title: draft.title.trim(),
      category: draft.category,
      minutes: mins,
      difficulty: draft.difficulty,
      servings: srv,
      ingredients,
      steps: draft.steps.split("\n").map((s) => s.trim()).filter(Boolean),
      favorite: false,
    };
    update((d) => ({ ...d, recipes: [recipe, ...d.recipes] }));
    toast.success("Recipe saved");
    setOpen(false);
    setDraft({ ...draft, title: "", ingredients: "", steps: "" });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Recipes"
        title="Cheap food that isn't sad"
        description="Your own recipe box — scale servings and cook from the steps."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setErrors({});
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> New recipe
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
              placeholder="Search by name or ingredient"
              aria-label="Search recipes"
              className="pl-9"
            />
          </div>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter category">
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
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
            icon={<ChefHat className="size-5" />}
            title="No recipes match"
            description="Try a different filter, or add one of your own."
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((r, i) => (
            <Panel key={r.id} delay={100 + i * 30}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display text-sm font-semibold">{r.title}</h3>
                    {r.sample ? <SampleFlag /> : null}
                  </div>
                  <p className="mt-1 text-xs text-mute">{r.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={r.favorite ? "Remove from favourites" : "Add to favourites"}
                  onClick={() =>
                    update((d) => ({
                      ...d,
                      recipes: d.recipes.map((x) =>
                        x.id === r.id ? { ...x, favorite: !x.favorite } : x,
                      ),
                    }))
                  }
                >
                  <Star className={`size-4 ${r.favorite ? "fill-current text-warning" : ""}`} />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="primary">
                  <Clock className="size-3" /> {r.minutes}m
                </Badge>
                <Badge>
                  <Users className="size-3" /> {r.servings}
                </Badge>
                <Badge tone={r.difficulty === "Easy" ? "success" : r.difficulty === "Hard" ? "danger" : "warning"}>
                  {r.difficulty}
                </Badge>
              </div>

              <p className="mt-3 line-clamp-2 text-xs text-mute">
                {r.ingredients.slice(0, 5).join(" · ")}
              </p>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setView(r);
                    setServings(r.servings);
                  }}
                >
                  Open recipe
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${r.title}`}
                  onClick={() => setToDelete(r)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* recipe viewer */}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        wide
        title={view?.title ?? ""}
        description={
          view ? `${view.category} · ${view.minutes} minutes · ${view.difficulty}` : ""
        }
      >
        {view ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Servings
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="Fewer servings">
                  −
                </Button>
                <span className="w-8 text-center font-display text-lg font-semibold tabular-nums">
                  {servings}
                </span>
                <Button size="sm" onClick={() => setServings((s) => Math.min(20, s + 1))} aria-label="More servings">
                  +
                </Button>
              </div>
              <Badge tone="accent2">scaled from {view.servings}</Badge>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-sm font-semibold">Ingredients</h3>
                <ul className="mt-2 space-y-1.5 text-[13px]">
                  {view.ingredients.map((ing, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="min-w-0">{scaleIngredient(ing, servings / view.servings)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold">Method</h3>
                <ol className="mt-2 space-y-2 text-[13px]">
                  {view.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0">{s}</span>
                    </li>
                  ))}
                  {view.steps.length === 0 ? <li className="text-mute">No steps saved.</li> : null}
                </ol>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* add recipe */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        wide
        title="New recipe"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              Save recipe
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" {...(errors["title"] ? { error: errors["title"] } : {})}>
            <Input
              value={draft.title}
              maxLength={80}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="15-minute peanut noodles"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Category">
              <Select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Minutes" {...(errors["minutes"] ? { error: errors["minutes"] } : {})}>
              <Input
                type="number"
                min={1}
                value={draft.minutes}
                onChange={(e) => setDraft({ ...draft, minutes: e.target.value })}
              />
            </Field>
            <Field label="Difficulty">
              <Select
                value={draft.difficulty}
                onChange={(e) =>
                  setDraft({ ...draft, difficulty: e.target.value as Recipe["difficulty"] })
                }
              >
                {DIFFICULTY.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Servings" {...(errors["servings"] ? { error: errors["servings"] } : {})}>
              <Input
                type="number"
                min={1}
                value={draft.servings}
                onChange={(e) => setDraft({ ...draft, servings: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label="Ingredients"
            hint="One per line, e.g. 200g pasta"
            {...(errors["ingredients"] ? { error: errors["ingredients"] } : {})}
          >
            <Textarea
              rows={6}
              value={draft.ingredients}
              onChange={(e) => setDraft({ ...draft, ingredients: e.target.value })}
            />
          </Field>
          <Field label="Method" hint="One step per line.">
            <Textarea
              rows={6}
              value={draft.steps}
              onChange={(e) => setDraft({ ...draft, steps: e.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete && update((d) => ({ ...d, recipes: d.recipes.filter((x) => x.id !== toDelete.id) }))
        }
        title="Delete this recipe?"
        message={`"${toDelete?.title ?? ""}" will be removed from your recipe box.`}
      />
    </div>
  );
}

/** Multiplies any leading number in an ingredient line by the scale factor. */
function scaleIngredient(line: string, factor: number): string {
  if (factor === 1) return line;
  return line.replace(/^(\d+(?:\.\d+)?)/, (m) => {
    const scaled = Number(m) * factor;
    return String(Math.round(scaled * 100) / 100);
  });
}
