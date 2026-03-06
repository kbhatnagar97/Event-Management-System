import './index.scss';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="progress">
      {label && <span className="progress__label">{label}</span>}
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress__text">
        {value}/{max} <span className="progress__pct">({pct}%)</span>
      </span>
    </div>
  );
}
