import Link from "next/link";
import GamePageWrapper from "@/components/ui/GamePageWrapper";

export default function LogicPage() {
  return (
    <GamePageWrapper title="הגיונית" icon="🧠" subtitle="בחרו רמת קושי">
      <div className="space-y-3 mt-2">
        <Link
          href="/logic/easy"
          className="flex items-center gap-4 p-4 rounded-2xl border bg-brand-surface border-brand-border hover:border-brand-accent transition-all"
        >
          <div className="text-3xl shrink-0">🟢</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-brand-text mb-0.5">הגיונית – קל</h2>
            <p className="text-brand-muted text-sm">חידה לוגית ברמת קושי קלה. חישבו מחוץ לקופסה.</p>
          </div>
          <div className="text-brand-muted shrink-0 text-lg">›</div>
        </Link>

        <Link
          href="/logic/hard"
          className="flex items-center gap-4 p-4 rounded-2xl border bg-brand-surface border-brand-border hover:border-brand-accent transition-all"
        >
          <div className="text-3xl shrink-0">🔴</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-brand-text mb-0.5">הגיונית – קשה</h2>
            <p className="text-brand-muted text-sm">חידה לוגית ברמת קושי גבוהה. לא מה שנראה.</p>
          </div>
          <div className="text-brand-muted shrink-0 text-lg">›</div>
        </Link>
      </div>
    </GamePageWrapper>
  );
}
