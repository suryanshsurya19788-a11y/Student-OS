import type { AppData, ResumeData, Settings } from "./types";
import { SUBJECT_COLORS } from "./types";
import { addDays, todayISO, toISODate } from "./date";

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const defaultSettings: Settings = {
  displayName: "Student",
  theme: "dark",
  accent: "teal",
  notifications: true,
  focusMinutes: 25,
  breakMinutes: 5,
  weekStart: 1,
  currency: "$",
  monthlyBudget: 400,
};

export const emptyResume: ResumeData = {
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
  },
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  skills: [],
  languages: [],
  sectionOrder: [
    "summary",
    "education",
    "experience",
    "projects",
    "skills",
    "certifications",
    "achievements",
    "languages",
  ],
  layout: "modern",
};

function color(i: number) {
  return SUBJECT_COLORS[i % SUBJECT_COLORS.length] as string;
}

export function buildSampleData(): AppData {
  const today = todayISO();
  const s1 = uid();
  const s2 = uid();
  const s3 = uid();
  const s4 = uid();
  const month = today.slice(0, 7);

  return {
    version: 1,
    settings: { ...defaultSettings },
    subjects: [
      { id: s1, name: "Calculus II", color: color(0), teacher: "Dr. Iyer", sample: true },
      { id: s2, name: "Data Structures", color: color(1), teacher: "Prof. Khan", sample: true },
      { id: s3, name: "Physics", color: color(2), teacher: "Dr. Moss", sample: true },
      { id: s4, name: "Microeconomics", color: color(3), teacher: "Dr. Alvarez", sample: true },
    ],
    sessions: [
      {
        id: uid(),
        subjectId: s1,
        title: "Problem set review",
        date: today,
        startTime: "09:00",
        duration: 60,
        priority: "high",
        completed: true,
        location: "Room 214",
        sample: true,
      },
      {
        id: uid(),
        subjectId: s2,
        title: "Graph traversal practice",
        date: today,
        startTime: "11:30",
        duration: 45,
        priority: "medium",
        completed: false,
        location: "Library",
        sample: true,
      },
      {
        id: uid(),
        subjectId: s3,
        title: "Lab report draft",
        date: today,
        startTime: "16:30",
        duration: 75,
        priority: "high",
        completed: false,
        location: "Lab C",
        sample: true,
      },
      {
        id: uid(),
        subjectId: s4,
        title: "Elasticity readings",
        date: addDays(today, 1),
        startTime: "10:00",
        duration: 60,
        priority: "low",
        completed: false,
        sample: true,
      },
      {
        id: uid(),
        subjectId: s2,
        title: "Project sprint",
        date: addDays(today, 2),
        startTime: "14:00",
        duration: 90,
        priority: "medium",
        completed: false,
        location: "Lab C",
        sample: true,
      },
      {
        id: uid(),
        subjectId: s1,
        title: "Series convergence drills",
        date: addDays(today, -1),
        startTime: "13:00",
        duration: 50,
        priority: "medium",
        completed: true,
        sample: true,
      },
      {
        id: uid(),
        subjectId: s3,
        title: "Optics revision",
        date: addDays(today, -2),
        startTime: "18:00",
        duration: 40,
        priority: "low",
        completed: true,
        sample: true,
      },
    ],
    exams: [
      {
        id: uid(),
        subjectId: s1,
        title: "Calculus II midterm",
        date: addDays(today, 9),
        startTime: "09:30",
        notes: "Chapters 5–8, closed book",
        sample: true,
      },
      {
        id: uid(),
        subjectId: s2,
        title: "Data Structures quiz",
        date: addDays(today, 4),
        startTime: "14:00",
        notes: "Trees and heaps",
        sample: true,
      },
    ],
    tasks: [
      {
        id: uid(),
        title: "Submit physics lab report",
        description: "Include the error analysis table and cite the lab manual.",
        due: today,
        priority: "high",
        category: "Assignment",
        completed: false,
        createdAt: addDays(today, -3),
        sample: true,
      },
      {
        id: uid(),
        title: "Read Calculus chapter 6",
        description: "Focus on Taylor series examples.",
        due: today,
        priority: "medium",
        category: "Homework",
        completed: true,
        completedAt: today,
        createdAt: addDays(today, -2),
        sample: true,
      },
      {
        id: uid(),
        title: "Review CS project pull request",
        description: "Check the hashmap resize logic.",
        due: today,
        priority: "medium",
        category: "Project",
        completed: false,
        createdAt: addDays(today, -1),
        sample: true,
      },
      {
        id: uid(),
        title: "Economics essay outline",
        description: "Three arguments plus a counterpoint.",
        due: addDays(today, 3),
        priority: "medium",
        category: "Assignment",
        completed: false,
        createdAt: addDays(today, -1),
        sample: true,
      },
      {
        id: uid(),
        title: "Book study room for finals",
        description: "",
        due: addDays(today, 5),
        priority: "low",
        category: "Personal",
        completed: false,
        createdAt: today,
        sample: true,
      },
      {
        id: uid(),
        title: "Return library books",
        description: "Two on the renewal limit.",
        due: addDays(today, -2),
        priority: "low",
        category: "Other",
        completed: false,
        createdAt: addDays(today, -6),
        sample: true,
      },
      {
        id: uid(),
        title: "Midterm revision plan",
        description: "Break each subject into 5 blocks.",
        due: addDays(today, -1),
        priority: "high",
        category: "Exam",
        completed: true,
        completedAt: addDays(today, -1),
        createdAt: addDays(today, -4),
        sample: true,
      },
    ],
    goals: [
      {
        id: uid(),
        title: "Finish the semester with a 3.7 GPA",
        description: "Keep every course above a B+.",
        kind: "long-term",
        targetDate: addDays(today, 70),
        progress: 62,
        milestones: [
          { id: uid(), title: "Pass all midterms", done: true },
          { id: uid(), title: "Submit the CS project", done: false },
          { id: uid(), title: "Score 85%+ in Physics final", done: false },
        ],
        sample: true,
      },
      {
        id: uid(),
        title: "Study 15 hours every week",
        description: "Spread across four subjects.",
        kind: "weekly",
        targetDate: addDays(today, 7),
        progress: 45,
        milestones: [
          { id: uid(), title: "Mon–Wed blocks done", done: true },
          { id: uid(), title: "Weekend revision", done: false },
        ],
        sample: true,
      },
      {
        id: uid(),
        title: "Read 20 pages a day",
        description: "Textbook or research papers.",
        kind: "daily",
        targetDate: addDays(today, 1),
        progress: 80,
        milestones: [],
        sample: true,
      },
    ],
    transactions: [
      {
        id: uid(),
        type: "income",
        amount: 600,
        category: "Other",
        note: "Monthly allowance",
        date: `${month}-01`,
        sample: true,
      },
      {
        id: uid(),
        type: "income",
        amount: 120,
        category: "Other",
        note: "Tutoring session",
        date: `${month}-08`,
        sample: true,
      },
      {
        id: uid(),
        type: "expense",
        amount: 62,
        category: "Food",
        note: "Groceries",
        date: `${month}-04`,
        sample: true,
      },
      {
        id: uid(),
        type: "expense",
        amount: 48,
        category: "Transport",
        note: "Bus pass",
        date: `${month}-05`,
        sample: true,
      },
      {
        id: uid(),
        type: "expense",
        amount: 33,
        category: "Education",
        note: "Lab manual",
        date: `${month}-07`,
        sample: true,
      },
      {
        id: uid(),
        type: "expense",
        amount: 41,
        category: "Entertainment",
        note: "Cinema with friends",
        date: `${month}-11`,
        sample: true,
      },
      {
        id: uid(),
        type: "expense",
        amount: 64,
        category: "Shopping",
        note: "Notebooks and pens",
        date: `${month}-13`,
        sample: true,
      },
    ],
    snippets: [
      {
        id: uid(),
        title: "Debounce a function",
        language: "TypeScript",
        description: "Delays a call until input stops arriving.",
        tags: ["utility", "performance"],
        favorite: true,
        createdAt: today,
        code: `export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
        sample: true,
      },
      {
        id: uid(),
        title: "Binary search",
        language: "Python",
        description: "Classic iterative binary search on a sorted list.",
        tags: ["algorithms", "interview"],
        favorite: false,
        createdAt: today,
        code: `def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
        sample: true,
      },
      {
        id: uid(),
        title: "Group rows by column",
        language: "SQL",
        description: "Counts orders per customer.",
        tags: ["database"],
        favorite: false,
        createdAt: today,
        code: `SELECT customer_id, COUNT(*) AS orders, SUM(total) AS revenue
FROM orders
WHERE created_at >= '2026-01-01'
GROUP BY customer_id
ORDER BY revenue DESC
LIMIT 20;`,
        sample: true,
      },
      {
        id: uid(),
        title: "Centre a box",
        language: "CSS",
        description: "Grid centring that always works.",
        tags: ["layout"],
        favorite: false,
        createdAt: today,
        code: `.centre {
  display: grid;
  place-items: center;
  min-height: 100dvh;
}`,
        sample: true,
      },
    ],
    recipes: [
      {
        id: uid(),
        title: "10-minute garlic noodles",
        category: "Dinner",
        minutes: 10,
        difficulty: "Easy",
        servings: 2,
        favorite: true,
        ingredients: [
          "200g instant or egg noodles",
          "4 garlic cloves, minced",
          "2 tbsp soy sauce",
          "1 tbsp butter or oil",
          "1 tsp sugar",
          "Spring onion to finish",
        ],
        steps: [
          "Boil the noodles until just tender, then drain.",
          "Melt the butter and cook the garlic on low heat for a minute until fragrant.",
          "Stir in the soy sauce and sugar.",
          "Toss the noodles through the sauce and top with spring onion.",
        ],
        sample: true,
      },
      {
        id: uid(),
        title: "Overnight oats",
        category: "Breakfast",
        minutes: 5,
        difficulty: "Easy",
        servings: 1,
        favorite: false,
        ingredients: [
          "50g rolled oats",
          "120ml milk of choice",
          "1 tbsp yoghurt",
          "1 tsp honey",
          "Fruit to top",
        ],
        steps: [
          "Mix the oats, milk, yoghurt and honey in a jar.",
          "Refrigerate overnight.",
          "Top with fruit before eating.",
        ],
        sample: true,
      },
      {
        id: uid(),
        title: "One-pan egg fried rice",
        category: "Dinner",
        minutes: 15,
        difficulty: "Easy",
        servings: 2,
        favorite: false,
        ingredients: [
          "2 cups cold cooked rice",
          "2 eggs, beaten",
          "1 cup frozen peas and carrots",
          "2 tbsp soy sauce",
          "1 tbsp oil",
        ],
        steps: [
          "Scramble the eggs in the hot pan and set aside.",
          "Fry the vegetables for two minutes.",
          "Add the rice, break up any clumps and fry until steaming.",
          "Return the eggs, add soy sauce and toss.",
        ],
        sample: true,
      },
      {
        id: uid(),
        title: "Study-session energy balls",
        category: "Snack",
        minutes: 12,
        difficulty: "Easy",
        servings: 12,
        favorite: false,
        ingredients: [
          "1 cup oats",
          "1/2 cup peanut butter",
          "1/3 cup honey",
          "1/4 cup dark chocolate chips",
        ],
        steps: [
          "Mix everything in a bowl until it holds together.",
          "Chill for 20 minutes.",
          "Roll into balls and keep refrigerated.",
        ],
        sample: true,
      },
      {
        id: uid(),
        title: "Tomato lentil soup",
        category: "Lunch",
        minutes: 30,
        difficulty: "Medium",
        servings: 4,
        favorite: false,
        ingredients: [
          "1 cup red lentils, rinsed",
          "1 tin chopped tomatoes",
          "1 onion, diced",
          "2 garlic cloves",
          "1 tsp cumin",
          "750ml stock",
        ],
        steps: [
          "Soften the onion and garlic in a large pot.",
          "Add cumin and cook for 30 seconds.",
          "Add the lentils, tomatoes and stock; simmer 20 minutes.",
          "Season and blend if you prefer a smooth soup.",
        ],
        sample: true,
      },
      {
        id: uid(),
        title: "Microwave mug omelette",
        category: "Breakfast",
        minutes: 4,
        difficulty: "Easy",
        servings: 1,
        favorite: false,
        ingredients: [
          "2 eggs",
          "1 tbsp milk",
          "Handful of grated cheese",
          "Chopped pepper or leftover veg",
        ],
        steps: [
          "Beat everything in a large mug.",
          "Microwave 45 seconds, stir, then 30–45 seconds more until set.",
        ],
        sample: true,
      },
    ],
    workouts: [
      {
        id: uid(),
        name: "Dorm room full body",
        category: "Full Body",
        durationMin: 25,
        sample: true,
        exercises: [
          { id: uid(), exerciseId: "squat", sets: 3, reps: 15, done: false },
          { id: uid(), exerciseId: "pushup", sets: 3, reps: 10, done: false },
          { id: uid(), exerciseId: "plank", sets: 3, reps: 40, done: false },
          { id: uid(), exerciseId: "burpee", sets: 2, reps: 8, done: false },
        ],
      },
      {
        id: uid(),
        name: "Desk-break core",
        category: "Core",
        durationMin: 12,
        sample: true,
        exercises: [
          { id: uid(), exerciseId: "deadbug", sets: 3, reps: 12, done: false },
          { id: uid(), exerciseId: "side-plank", sets: 2, reps: 30, done: false },
          { id: uid(), exerciseId: "crunch", sets: 3, reps: 15, done: false },
        ],
      },
    ],
    workoutLogs: [
      {
        id: uid(),
        planId: "sample",
        planName: "Dorm room full body",
        date: addDays(today, -2),
        durationMin: 25,
        exercisesDone: 4,
      },
      {
        id: uid(),
        planId: "sample",
        planName: "Desk-break core",
        date: addDays(today, -4),
        durationMin: 12,
        exercisesDone: 3,
      },
    ],
    focusSessions: [
      ...[0, 1, 2, 3, 4, 5].flatMap((i) => {
        const date = addDays(today, -i);
        const counts = [3, 4, 2, 5, 3, 2];
        return Array.from({ length: counts[i] as number }, () => ({
          id: uid(),
          date,
          minutes: 25,
          label: "Focus block",
        }));
      }),
    ],
    resume: {
      ...emptyResume,
      personal: {
        name: "Sample Student",
        title: "Computer Science undergraduate",
        email: "sample.student@example.edu",
        phone: "+1 555 0100",
        location: "Boston, MA",
        website: "sample-student.example",
        summary:
          "Second-year CS student with a focus on data structures and web development. Comfortable shipping small full-stack projects and tutoring first-year maths.",
      },
      education: [
        {
          id: uid(),
          a: "BSc Computer Science",
          b: "Example State University",
          c: "2024 — 2028",
          d: "GPA 3.7. Coursework: algorithms, databases, linear algebra.",
        },
      ],
      experience: [
        {
          id: uid(),
          a: "Maths tutor",
          b: "Campus Learning Centre",
          c: "2025 — present",
          d: "Run weekly calculus sessions for groups of up to eight students.",
        },
      ],
      projects: [
        {
          id: uid(),
          a: "StudentOS",
          b: "React, TypeScript",
          c: "2026",
          d: "Local-first productivity dashboard with planner, timer and expense tracking.",
        },
      ],
      certifications: [],
      achievements: [
        { id: uid(), a: "Dean's List", b: "Example State University", c: "2025", d: "" },
      ],
      skills: ["TypeScript", "React", "Python", "SQL", "Git"],
      languages: ["English (native)", "Spanish (intermediate)"],
    },
  };
}

export function emptyData(): AppData {
  return {
    version: 1,
    settings: { ...defaultSettings },
    subjects: [],
    sessions: [],
    exams: [],
    tasks: [],
    goals: [],
    transactions: [],
    snippets: [],
    recipes: [],
    workouts: [],
    workoutLogs: [],
    focusSessions: [],
    resume: { ...emptyResume },
  };
}

export const seedToday = toISODate(new Date());
