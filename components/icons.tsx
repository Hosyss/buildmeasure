type IconProps = {
  className?: string;
};

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11M11 5.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m4.5 10.2 3.3 3.3 7.7-7.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalculatorIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2.75" width="16" height="18.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 6.5h9v3h-9zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function ProjectIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4 7.5h6l1.4 2H20v8.75A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V7.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 7.5V5.75C4 4.78 4.78 4 5.75 4h3.5L11 6h7.25C19.22 6 20 6.78 20 7.75v1.75" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ResetIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5.1 6.2A6 6 0 1 1 4.2 11M5.1 6.2V2.8m0 3.4H1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <rect x="6.2" y="6.2" width="9.6" height="9.6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.8 6.2V4.5A1.5 1.5 0 0 0 12.3 3H4.5A1.5 1.5 0 0 0 3 4.5v7.8a1.5 1.5 0 0 0 1.5 1.5h1.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PrintIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 7V3h10v4M5 14H3.8A1.8 1.8 0 0 1 2 12.2V8.8A1.8 1.8 0 0 1 3.8 7h12.4A1.8 1.8 0 0 1 18 8.8v3.4a1.8 1.8 0 0 1-1.8 1.8H15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 11.5h10V17H5z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.8 9.7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SaveIcon({ className }: IconProps) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M3.2 4.2c0-.55.45-1 1-1h9.9l2.7 2.7v9.9c0 .55-.45 1-1 1H4.2a1 1 0 0 1-1-1V4.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 3.2v4h7v-4M6.5 16.8v-5.5h7v5.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
