/** SVG marks lifted verbatim from the Paper artboards. */

export function BoltMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2L4 11h4.5L9 18l7-9h-4.5L11 2z" fill="#111111" />
    </svg>
  );
}

export function Mascot({ size = 150 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="62" r="42" fill="#111111" />
      <circle cx="46" cy="54" r="7" fill="#FFFFFF" />
      <circle cx="74" cy="54" r="7" fill="#FFFFFF" />
      <circle cx="47.5" cy="56" r="3.4" fill="#111111" />
      <circle cx="75.5" cy="56" r="3.4" fill="#111111" />
      <path
        d="M48 76c4.5 5.5 19.5 5.5 24 0"
        fill="none"
        stroke="#F5C518"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d="M62 8L48 30h10l-3 18 16-24h-10l4-16z" fill="#111111" />
    </svg>
  );
}

export function Plus({ size = 16, stroke = '#111111' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 2V14M2 8H14"
        fill="none"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 7.5h10M8 3.5l4 4-4 4"
        fill="none"
        stroke="#F5C518"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Shield({ size = 16, stroke = '#111111', width = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 1.8 2.5 4.2v3.9c0 3.3 2.3 5.5 5.5 6.4 3.2-.9 5.5-3.1 5.5-6.4V4.2L8 1.8Z"
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.5 2.5 10.5h6L10 18.5l7.5-9h-6L10 1.5Z" fill="#111111" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10.5 8 15.5 17 5"
        fill="none"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WitnessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3.2" fill="none" stroke="#111111" strokeWidth="2" />
      <path
        d="M2 17c0-2.8 2.2-4.6 5-4.6s5 1.8 5 4.6"
        fill="none"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="14.5" cy="8" r="2.4" fill="none" stroke="#111111" strokeWidth="1.6" />
    </svg>
  );
}
