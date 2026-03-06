import type { ReactNode } from 'react';
import './index.scss';

interface BottomSheetProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

export function BottomSheet({ open, children, onClose, title }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet__handle" />
        {title && <h3 className="bottom-sheet__title">{title}</h3>}
        <div className="bottom-sheet__body">{children}</div>
      </div>
    </div>
  );
}
