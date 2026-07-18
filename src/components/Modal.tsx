import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onDismiss: () => void;
  labelledBy: string;
  narrow?: boolean;
}

export function Modal({ children, onDismiss, labelledBy, narrow }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return (
    <div
      className="scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`modal${narrow ? ' modal--narrow' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
