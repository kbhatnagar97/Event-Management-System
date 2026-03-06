import type { ReactNode } from 'react';
import './index.scss';

interface OverlayProps {
  open: boolean;
  children: ReactNode;
  onClose?: () => void;
}

export function Overlay({ open, children, onClose }: OverlayProps) {
  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay__content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
