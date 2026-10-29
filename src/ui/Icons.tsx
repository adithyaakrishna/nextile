interface IconProps {
  className?: string;
}

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function SoundOnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className} aria-hidden="true" focusable="false">
      <path d="M4 9h4l5-4v14l-5-4H4z" {...STROKE} fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" {...STROKE} />
    </svg>
  );
}

export function SoundOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className} aria-hidden="true" focusable="false">
      <path d="M4 9h4l5-4v14l-5-4H4z" {...STROKE} fill="currentColor" />
      <path d="M16 9l6 6M22 9l-6 6" {...STROKE} />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className} aria-hidden="true" focusable="false">
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" {...STROKE} />
      <rect x="14" y="4.5" width="4" height="5" rx="1" {...STROKE} />
      <rect x="8" y="14.5" width="4" height="5" rx="1" {...STROKE} />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" className={className} aria-hidden="true" focusable="false">
      <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="square" />
    </svg>
  );
}

export function CrossIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" className={className} aria-hidden="true" focusable="false">
      <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="square" />
    </svg>
  );
}
