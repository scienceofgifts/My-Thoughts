import React from 'react';

interface MotifProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className = 'text-[#252525]', size = 20 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" strokeDasharray="1.5 3" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeWidth="1" />
    </svg>
  );
}

export function SparkMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
    </svg>
  );
}

export function BotheringMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.5" strokeDasharray="1.5 2" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2" strokeWidth="1" />
    </svg>
  );
}

export function InquiryMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L17.5 17.5" />
      <circle cx="9" cy="9" r="2" strokeWidth="0.9" />
    </svg>
  );
}

export function UntrueMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M6 14L14 6" />
    </svg>
  );
}

export function CompassMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.5" />
      <polygon points="10,4.5 12.5,10 10,15.5 7.5,10" strokeWidth="1" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function ActionMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 10h11M10 6l4 4-4 4" />
      <path d="M17 5v10" strokeDasharray="1.5 2" />
    </svg>
  );
}

export function NextMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 10h12M12 6l4 4-4 4" />
    </svg>
  );
}

export function BranchMark({ className = 'text-[#6B6A67]', size = 16 }: MotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5" cy="15" r="2" />
      <circle cx="15" cy="5" r="2" />
      <circle cx="15" cy="15" r="2" />
      <path d="M5 13V8a3 3 0 013-3h5" />
      <path d="M7 15h6" />
    </svg>
  );
}

export function ResolveMark({ className = 'text-[#6B6A67]', size = 16, resolved = false }: MotifProps & { resolved?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" />
      {resolved ? (
        <path d="M7 10.5l2 2 4.5-4.5" strokeWidth="1.4" />
      ) : (
        <circle cx="10" cy="10" r="2" strokeDasharray="1.5 2" />
      )}
    </svg>
  );
}

export function EmptyAbstractArt({ className = 'text-[#D6CEBE]' }: { className?: string }) {
  return (
    <svg
      width="140"
      height="90"
      viewBox="0 0 140 90"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Delicate layered organic loops representing uncluttered space */}
      <path
        d="M20 50 C 25 25, 60 20, 80 40 C 95 55, 120 45, 125 60 C 130 75, 100 80, 70 75 C 40 70, 15 75, 20 50 Z"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M45 45 C 55 30, 85 32, 95 48 C 105 60, 85 68, 65 65 C 45 62, 38 55, 45 45 Z"
        strokeWidth="1.2"
      />
      <circle cx="70" cy="48" r="3" strokeWidth="1" />
      <path d="M70 20 v 6 M70 70 v 6 M20 48 h 6 M115 48 h 6" strokeWidth="0.8" />
    </svg>
  );
}

export function HairlineSeparator({ className = 'my-6' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="w-full border-t border-[#E8E5DF]" />
      <div className="absolute px-2 bg-[#FAF9F6] text-[#A39F97] text-[10px] tracking-widest uppercase font-sans">
        · · ·
      </div>
    </div>
  );
}
