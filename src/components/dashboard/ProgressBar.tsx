export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="progress-wrap">
      <div className="progress-label">
        <span>Course progress</span>
        <span>{percent}%</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
