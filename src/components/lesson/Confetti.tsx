const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7'];

export function Confetti() {
  const pieces = Array.from({ length: 40 });

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.2;
        const duration = 0.8 + Math.random() * 0.5;
        const drift = (Math.random() - 0.5) * 80;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              background: COLORS[i % COLORS.length],
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              ['--drift' as string]: `${drift}px`,
            }}
          />
        );
      })}
    </div>
  );
}
