import type { GameInfo } from "@/types";

export const GAMES: GameInfo[] = [
  {
    id: "connections",
    title: "מה הקשר",
    description: "20 מילים, 5 קבוצות נסתרות. מצאו את הקשר המשותף.",
    icon: "🔗",
    path: "/connections",
  },
  {
    id: "logic-easy",
    title: "הגיונית",
    description: "חידה לוגית. קונספט פשוט, פתרון פחות פשוט.",
    icon: "🧠",
    path: "/logic",
  },
  {
    id: "chain",
    title: "השרשרת",
    description: "חברו בין שתי מילים דרך שרשרת של מושגים.",
    icon: "⛓️",
    path: "/chain",
  },
  {
    id: "which-song",
    title: "איזה שיר",
    description: "זיהוי שיר לפי התרגום שלו בלבד.",
    icon: "🎵",
    path: "/which-song",
  },
  {
    id: "who-am-i",
    title: "מי אני",
    description: "זהו את הדמות המסתורית בתמונה כמה שיותר מהר.",
    icon: "🕵️",
    path: "/who-am-i",
  },
];
