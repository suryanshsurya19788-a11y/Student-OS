import { uid } from "./sampleData";
import type { ResumeData } from "./types";

/* --------------------------------- Types --------------------------------- */

export type CvTemplate = "modern" | "minimal" | "professional" | "academic";
export type CvAccent = "teal" | "purple" | "blue" | "green" | "black";

export type ContactKey = "location" | "email" | "phone" | "linkedin" | "github" | "website";

export interface CvPersonal {
  name: string;
  headline: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  photo: string; // data URL, stored locally
}

export interface CvSkill {
  id: string;
  name: string;
  category: string;
}
export interface CvLanguage {
  id: string;
  name: string;
  level: string;
}
export interface CvEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  start: string; // "YYYY-MM" or "YYYY" or ""
  end: string;
  current: boolean;
  description: string;
  achievements: string; // one per line
}
export interface CvProject {
  id: string;
  name: string;
  type: string;
  description: string; // one bullet per line
  technologies: string;
  link: string;
  start: string;
  end: string;
}
export interface CvExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
  bullets: string; // one per line
}
export interface CvCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}
export interface CvAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
}
export interface CvCreative {
  id: string;
  title: string;
  type: string;
  description: string;
  link: string;
}

export interface CvData {
  id: string;
  label: string;
  updatedAt: string;
  template: CvTemplate;
  accent: CvAccent;
  showContact: Record<ContactKey, boolean>;
  personal: CvPersonal;
  summary: string;
  skills: CvSkill[];
  tools: string[];
  languages: CvLanguage[];
  education: CvEducation[];
  projects: CvProject[];
  experience: CvExperience[];
  certifications: CvCertification[];
  achievements: CvAchievement[];
  creative: CvCreative[];
  additionalSkills: string[];
  interests: string[];
  quote: string;
}

/* -------------------------------- Presets -------------------------------- */

/** Muted, print-friendly accents. `soft` tints the sidebar. */
export const CV_ACCENTS: Record<CvAccent, { label: string; ink: string; soft: string }> = {
  teal: { label: "Teal", ink: "oklch(0.42 0.07 190)", soft: "oklch(0.95 0.025 180)" },
  purple: { label: "Purple", ink: "oklch(0.42 0.1 300)", soft: "oklch(0.95 0.02 300)" },
  blue: { label: "Blue", ink: "oklch(0.4 0.09 255)", soft: "oklch(0.95 0.02 250)" },
  green: { label: "Green", ink: "oklch(0.42 0.08 150)", soft: "oklch(0.95 0.03 145)" },
  black: { label: "Black", ink: "oklch(0.25 0.01 260)", soft: "oklch(0.95 0.004 260)" },
};

export const CV_TEMPLATES: { value: CvTemplate; label: string; hint: string }[] = [
  { value: "modern", label: "Modern", hint: "Two columns, tinted sidebar" },
  { value: "minimal", label: "Minimal", hint: "Single column, mostly white" },
  { value: "professional", label: "Professional", hint: "Two columns, dark sidebar" },
  { value: "academic", label: "Academic", hint: "Single column, serif" },
];

export const CONTACT_LABELS: Record<ContactKey, string> = {
  location: "Location",
  email: "Email",
  phone: "Phone",
  linkedin: "LinkedIn",
  github: "GitHub",
  website: "Portfolio",
};

/* ------------------------------- Factories ------------------------------- */

export function emptyCv(label = "My resume"): CvData {
  return {
    id: uid(),
    label,
    updatedAt: new Date().toISOString(),
    template: "modern",
    accent: "teal",
    showContact: {
      location: true,
      email: true,
      phone: true,
      linkedin: true,
      github: true,
      website: true,
    },
    personal: {
      name: "",
      headline: "",
      tagline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      github: "",
      linkedin: "",
      photo: "",
    },
    summary: "",
    skills: [],
    tools: [],
    languages: [],
    education: [],
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    creative: [],
    additionalSkills: [],
    interests: [],
    quote: "",
  };
}

export const newEducation = (): CvEducation => ({
  id: uid(), degree: "", institution: "", location: "", start: "", end: "",
  current: false, description: "", achievements: "",
});
export const newProject = (): CvProject => ({
  id: uid(), name: "", type: "", description: "", technologies: "", link: "", start: "", end: "",
});
export const newExperience = (): CvExperience => ({
  id: uid(), role: "", company: "", location: "", start: "", end: "",
  current: false, description: "", bullets: "",
});
export const newCertification = (): CvCertification => ({
  id: uid(), name: "", issuer: "", date: "", link: "",
});
export const newAchievement = (): CvAchievement => ({
  id: uid(), title: "", description: "", date: "",
});
export const newCreative = (): CvCreative => ({
  id: uid(), title: "", type: "", description: "", link: "",
});

/** Fills missing keys so older or imported resumes never crash the editor. */
export function normalizeCv(raw: Partial<CvData> | undefined): CvData {
  const base = emptyCv();
  const r = raw ?? {};
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    ...base,
    ...r,
    id: typeof r.id === "string" && r.id ? r.id : base.id,
    showContact: { ...base.showContact, ...(r.showContact ?? {}) },
    personal: { ...base.personal, ...(r.personal ?? {}) },
    skills: arr(r.skills),
    tools: arr(r.tools),
    languages: arr(r.languages),
    education: arr<CvEducation>(r.education).map((e) => ({ ...newEducation(), ...e })),
    projects: arr<CvProject>(r.projects).map((e) => ({ ...newProject(), ...e })),
    experience: arr<CvExperience>(r.experience).map((e) => ({ ...newExperience(), ...e })),
    certifications: arr(r.certifications),
    achievements: arr(r.achievements),
    creative: arr(r.creative),
    additionalSkills: arr(r.additionalSkills),
    interests: arr(r.interests),
  };
}

/** One-time conversion from the original simple resume shape. */
export function fromLegacy(old: ResumeData | undefined): CvData {
  const cv = emptyCv();
  if (!old) return cv;
  cv.personal = {
    ...cv.personal,
    name: old.personal.name,
    headline: old.personal.title,
    email: old.personal.email,
    phone: old.personal.phone,
    location: old.personal.location,
    website: old.personal.website,
  };
  cv.summary = old.personal.summary;
  cv.skills = old.skills.map((name) => ({ id: uid(), name, category: "" }));
  cv.languages = old.languages.map((name) => ({ id: uid(), name, level: "" }));
  cv.education = old.education.map((e) => ({
    ...newEducation(), degree: e.a, institution: e.b, description: e.d,
  }));
  cv.experience = old.experience.map((e) => ({
    ...newExperience(), role: e.a, company: e.b, description: e.d,
  }));
  cv.projects = old.projects.map((e) => ({
    ...newProject(), name: e.a, technologies: e.b, description: e.d,
  }));
  cv.certifications = old.certifications.map((e) => ({
    ...newCertification(), name: e.a, issuer: e.b,
  }));
  cv.achievements = old.achievements.map((e) => ({
    ...newAchievement(), title: e.a, description: e.d,
  }));
  return cv;
}

/* --------------------------------- Dates --------------------------------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formats "YYYY-MM" → "Jan 2026", "YYYY" → "2026". Anything that is not a
 * plausible date (partial years like 0002, garbage) returns "" so it never prints.
 */
export function formatCvDate(value: string): string {
  const v = (value ?? "").trim();
  const m = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/.exec(v);
  if (!m) return "";
  const year = Number(m[1]);
  if (year < 1950 || year > 2100) return "";
  if (!m[2]) return String(year);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return String(year);
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatRange(start: string, end: string, current = false): string {
  const s = formatCvDate(start);
  const e = current ? "Present" : formatCvDate(end);
  if (s && e) return s === e ? s : `${s} – ${e}`;
  return s || e;
}

/* -------------------------------- Helpers -------------------------------- */

export const lines = (text: string) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);

export const has = (s: string | undefined) => !!s && s.trim().length > 0;

/** Display a URL without protocol; produce a safe href or null. */
export function linkParts(raw: string): { text: string; href: string | null } {
  const v = (raw ?? "").trim();
  if (!v) return { text: "", href: null };
  const text = v.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (/^(javascript|data|vbscript):/i.test(v)) return { text, href: null };
  const href = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    new URL(href);
    return { text, href };
  } catch {
    return { text, href: null };
  }
}

/** A neutral demo the user can load explicitly — never shown unless requested. */
export function exampleCv(): CvData {
  const cv = emptyCv("Example resume");
  cv.personal = {
    ...cv.personal,
    name: "Jordan Lee",
    headline: "Computer Science Student | Front-end Developer",
    tagline: "Building fast, accessible interfaces and learning in public.",
    email: "jordan.lee@email.com",
    phone: "+1 555 010 2030",
    location: "Toronto, Canada",
    github: "github.com/jordanlee",
    linkedin: "linkedin.com/in/jordanlee",
    website: "jordanlee.dev",
  };
  cv.summary =
    "Second-year computer science student with hands-on experience shipping small web apps. Comfortable with React and TypeScript, enjoys turning messy requirements into clean, usable interfaces, and tutors first-year programming.";
  cv.skills = ["Web Development", "HTML, CSS & JavaScript", "React & TypeScript", "Responsive Design", "Data Structures"].map(
    (name) => ({ id: uid(), name, category: "" }),
  );
  cv.tools = ["Git & GitHub", "VS Code", "Figma", "Vite", "Linux"];
  cv.languages = [
    { id: uid(), name: "English", level: "Native" },
    { id: uid(), name: "French", level: "Intermediate" },
  ];
  cv.education = [
    {
      ...newEducation(),
      degree: "B.Sc. Computer Science",
      institution: "University of Toronto",
      location: "Toronto",
      start: "2025-09",
      current: true,
      achievements: "Dean's List, first year\nRelevant coursework: Algorithms, Databases, Discrete Maths",
    },
  ];
  cv.projects = [
    {
      ...newProject(),
      name: "Campus Planner",
      type: "Personal project",
      description: "Offline-first study planner used by 200+ classmates\nCut page load time by 60% with code splitting",
      technologies: "React, TypeScript, IndexedDB",
      link: "planner.jordanlee.dev",
      start: "2026-01",
      end: "2026-04",
    },
  ];
  cv.experience = [
    {
      ...newExperience(),
      role: "Programming Tutor",
      company: "Campus Learning Centre",
      location: "Toronto",
      start: "2025-10",
      current: true,
      bullets: "Run weekly Python sessions for groups of up to 10 students\nWrote practice sets now reused across three sections",
    },
  ];
  cv.certifications = [
    { ...newCertification(), name: "Responsive Web Design", issuer: "freeCodeCamp", date: "2025-06" },
  ];
  cv.interests = ["Human-computer interaction", "Open source", "EdTech"];
  cv.quote = "Make it work, make it right, make it fast.";
  return cv;
}
