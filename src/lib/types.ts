export type ID = string;

export type Priority = "low" | "medium" | "high";
export const PRIORITIES: Priority[] = ["low", "medium", "high"];

export type TaskCategory =
  | "Homework"
  | "Assignment"
  | "Exam"
  | "Project"
  | "Personal"
  | "Other";
export const TASK_CATEGORIES: TaskCategory[] = [
  "Homework",
  "Assignment",
  "Exam",
  "Project",
  "Personal",
  "Other",
];

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Education"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Other";
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Education",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
];

export const SUBJECT_COLORS = [
  "oklch(0.785 0.133 181.9)",
  "oklch(0.657 0.182 261.7)",
  "oklch(0.75 0.15 155)",
  "oklch(0.82 0.15 78)",
  "oklch(0.7 0.18 350)",
  "oklch(0.72 0.17 300)",
  "oklch(0.72 0.15 30)",
  "oklch(0.7 0.13 220)",
];

export interface Sampleable {
  sample?: boolean;
}

export interface Subject extends Sampleable {
  id: ID;
  name: string;
  color: string;
  teacher?: string;
}

export interface StudySession extends Sampleable {
  id: ID;
  subjectId: ID | "";
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // minutes
  priority: Priority;
  completed: boolean;
  location?: string;
}

export interface Exam extends Sampleable {
  id: ID;
  subjectId: ID | "";
  title: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface Task extends Sampleable {
  id: ID;
  title: string;
  description: string;
  due: string; // YYYY-MM-DD or ""
  priority: Priority;
  category: TaskCategory;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: ID;
  title: string;
  done: boolean;
}

export type GoalKind = "daily" | "weekly" | "long-term";

export interface Goal extends Sampleable {
  id: ID;
  title: string;
  description: string;
  kind: GoalKind;
  targetDate: string;
  progress: number; // 0-100
  milestones: Milestone[];
}

export interface Transaction extends Sampleable {
  id: ID;
  type: "income" | "expense";
  amount: number;
  category: ExpenseCategory;
  note: string;
  date: string;
}

export interface Snippet extends Sampleable {
  id: ID;
  title: string;
  language: string;
  description: string;
  tags: string[];
  code: string;
  favorite: boolean;
  createdAt: string;
}

export interface Recipe extends Sampleable {
  id: ID;
  title: string;
  category: string;
  minutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  ingredients: string[];
  steps: string[];
  favorite: boolean;
}

export interface PlanExercise {
  id: ID;
  exerciseId: string;
  sets: number;
  reps: number;
  done: boolean;
}

export interface WorkoutPlan extends Sampleable {
  id: ID;
  name: string;
  category: string;
  durationMin: number;
  exercises: PlanExercise[];
}

export interface WorkoutLog {
  id: ID;
  planId: ID;
  planName: string;
  date: string;
  durationMin: number;
  exercisesDone: number;
}

export interface FocusSession {
  id: ID;
  date: string;
  minutes: number;
  label: string;
  taskId?: ID;
  subjectId?: ID;
}

export interface ResumeEntry {
  id: ID;
  a: string; // primary (role / degree / project name / cert)
  b: string; // secondary (company / school / tech)
  c: string; // dates
  d: string; // description
}

export interface ResumeData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  education: ResumeEntry[];
  experience: ResumeEntry[];
  projects: ResumeEntry[];
  certifications: ResumeEntry[];
  achievements: ResumeEntry[];
  skills: string[];
  languages: string[];
  sectionOrder: string[];
  layout: "classic" | "modern" | "compact";
}

export interface Settings {
  displayName: string;
  theme: "dark" | "light";
  accent: "teal" | "violet" | "amber" | "rose" | "emerald";
  notifications: boolean;
  focusMinutes: number;
  breakMinutes: number;
  weekStart: 0 | 1;
  currency: string;
  monthlyBudget: number;
}

export interface AppData {
  version: number;
  settings: Settings;
  subjects: Subject[];
  sessions: StudySession[];
  exams: Exam[];
  tasks: Task[];
  goals: Goal[];
  transactions: Transaction[];
  snippets: Snippet[];
  recipes: Recipe[];
  workouts: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  focusSessions: FocusSession[];
  resume: ResumeData;
  /** Resume builder documents (v2). Optional for backwards compatibility. */
  cvs?: import("./cv").CvData[];
  activeCvId?: string;
}
