import Link from "next/link";
import ShareButton from "./ShareButton";

interface Props {
  solved: boolean;
  score: number;
  shareText: string;
  explanation?: string;
}

export default function GameResult({ solved, score, shareText, explanation }: Props) {
  return (
    <div className="mt-4 p-5 bg-brand-surface border border-brand-border rounded-2xl space-y-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{solved ? "🎉" : "😅"}</span>
        <div>
          <p className="font-bold text-brand-text">{solved ? "כל הכבוד, פתרתם!" : "לא הצלחתם הפעם"}</p>
          {solved && <p className="text-brand-accent font-bold text-lg">{score} נקודות</p>}
        </div>
      </div>
      {explanation && (
        <p className="text-brand-muted text-sm border-t border-brand-border pt-3">{explanation}</p>
      )}
      <div className="flex gap-3 flex-wrap pt-1">
        {solved && <ShareButton text={shareText} />}
        <Link href="/" className="px-4 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-sm font-medium transition-colors">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
