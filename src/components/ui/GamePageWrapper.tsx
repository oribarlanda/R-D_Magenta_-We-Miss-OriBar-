import Link from "next/link";

interface Props {
  title: string;
  icon: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function GamePageWrapper({ title, icon, subtitle, children }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-accent transition-colors text-lg">
          ‹
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h1 className="text-xl font-bold text-brand-text">{title}</h1>
          </div>
          {subtitle && <p className="text-brand-muted text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
