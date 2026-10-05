export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const WORKOUT_CATEGORIES = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Chest",
  "Back",
  "Arms",
  "Core",
  "Cardio",
  "Beginner",
];

export const EXERCISES: Exercise[] = [
  {
    id: "pushup",
    name: "Push-up",
    category: "Chest",
    description:
      "Hands slightly wider than shoulders, body in one line, lower until elbows reach 90°, press back up.",
  },
  {
    id: "incline-pushup",
    name: "Incline Push-up",
    category: "Beginner",
    description:
      "Hands on a desk or chair. Easier angle for building pressing strength.",
  },
  {
    id: "dips",
    name: "Chair Dips",
    category: "Arms",
    description:
      "Hands on the edge of a chair behind you, lower your hips, press back up using your triceps.",
  },
  {
    id: "pullup",
    name: "Pull-up",
    category: "Back",
    description:
      "Hang from a bar with an overhand grip and pull your chin above the bar, controlling the descent.",
  },
  {
    id: "row",
    name: "Bent-over Row",
    category: "Back",
    description:
      "Hinge at the hips with a flat back, pull weight to the ribcage, squeeze the shoulder blades.",
  },
  {
    id: "superman",
    name: "Superman Hold",
    category: "Back",
    description:
      "Lie face down, lift chest, arms and legs off the floor and hold while breathing steadily.",
  },
  {
    id: "squat",
    name: "Bodyweight Squat",
    category: "Lower Body",
    description:
      "Feet shoulder width, sit back and down keeping your chest up, drive through the heels.",
  },
  {
    id: "lunge",
    name: "Forward Lunge",
    category: "Lower Body",
    description:
      "Step forward and lower the back knee towards the floor, then push back to standing.",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "Lower Body",
    description:
      "Lie on your back, feet flat, drive hips upward and squeeze the glutes at the top.",
  },
  {
    id: "calf-raise",
    name: "Calf Raise",
    category: "Lower Body",
    description:
      "Rise onto the balls of your feet, pause at the top, lower slowly.",
  },
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    description:
      "Forearms under shoulders, brace the abs and glutes, keep a straight line from head to heels.",
  },
  {
    id: "side-plank",
    name: "Side Plank",
    category: "Core",
    description:
      "Stack the feet, lift the hips, hold with the shoulder directly over the elbow.",
  },
  {
    id: "deadbug",
    name: "Dead Bug",
    category: "Core",
    description:
      "On your back, extend the opposite arm and leg while keeping the lower back pressed down.",
  },
  {
    id: "crunch",
    name: "Crunch",
    category: "Core",
    description:
      "Curl the shoulders off the floor with the abs, avoid pulling on the neck.",
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    category: "Cardio",
    description:
      "From a plank, drive the knees to the chest alternately at a brisk pace.",
  },
  {
    id: "jumping-jack",
    name: "Jumping Jack",
    category: "Cardio",
    description:
      "Jump the feet wide while raising the arms overhead, return to standing.",
  },
  {
    id: "high-knees",
    name: "High Knees",
    category: "Cardio",
    description: "Run on the spot lifting each knee to hip height.",
  },
  {
    id: "burpee",
    name: "Burpee",
    category: "Full Body",
    description:
      "Squat, kick back to a plank, optional push-up, jump the feet in and jump up.",
  },
  {
    id: "bear-crawl",
    name: "Bear Crawl",
    category: "Full Body",
    description:
      "Knees hovering just off the floor, crawl forward moving the opposite hand and foot.",
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    category: "Upper Body",
    description:
      "Press weights overhead from shoulder height without arching the lower back.",
  },
  {
    id: "pike-pushup",
    name: "Pike Push-up",
    category: "Upper Body",
    description:
      "Hips high in an inverted V, lower the crown of the head towards the floor, press up.",
  },
  {
    id: "bicep-curl",
    name: "Bicep Curl",
    category: "Arms",
    description: "Curl weights to the shoulders with the elbows pinned to the ribs.",
  },
  {
    id: "wall-sit",
    name: "Wall Sit",
    category: "Beginner",
    description: "Back flat to a wall, thighs parallel to the floor, hold.",
  },
  {
    id: "march",
    name: "Standing March",
    category: "Beginner",
    description: "Low impact knee lifts to warm up the hips and raise the heart rate.",
  },
];

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);
