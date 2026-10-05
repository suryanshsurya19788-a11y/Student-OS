import {
  LayoutDashboard,
  CalendarRange,
  CheckSquare,
  Timer,
  Target,
  Calculator,
  Wallet,
  FileText,
  Code2,
  ChefHat,
  Dumbbell,
  FolderCog,
  QrCode,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";

import type { LinkProps } from "@tanstack/react-router";

export interface NavItem {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  short: string;
  icon: LucideIcon;
  group: "Study" | "Life" | "Tools";
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard, group: "Study" },
  { to: "/planner", label: "Study Planner", short: "Planner", icon: CalendarRange, group: "Study" },
  { to: "/tasks", label: "Tasks", short: "Tasks", icon: CheckSquare, group: "Study" },
  { to: "/focus", label: "Focus Timer", short: "Focus", icon: Timer, group: "Study" },
  { to: "/goals", label: "Goals", short: "Goals", icon: Target, group: "Study" },
  { to: "/calculators", label: "Calculators", short: "Calc", icon: Calculator, group: "Study" },
  { to: "/expenses", label: "Expenses", short: "Money", icon: Wallet, group: "Life" },
  { to: "/resume", label: "Resume Builder", short: "Resume", icon: FileText, group: "Life" },
  { to: "/snippets", label: "Code Snippets", short: "Code", icon: Code2, group: "Life" },
  { to: "/recipes", label: "Recipes", short: "Food", icon: ChefHat, group: "Life" },
  { to: "/workouts", label: "Workout Planner", short: "Train", icon: Dumbbell, group: "Life" },
  { to: "/files", label: "File Tools", short: "Files", icon: FolderCog, group: "Tools" },
  { to: "/qr", label: "QR & Link Tools", short: "QR", icon: QrCode, group: "Tools" },
  { to: "/settings", label: "Settings", short: "Setup", icon: SettingsIcon, group: "Tools" },
];

export const NAV_GROUPS: NavItem["group"][] = ["Study", "Life", "Tools"];
