import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './index.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', loading, icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`btn btn--${variant} ${loading ? 'btn--loading' : ''} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="btn__spinner" />}
      <span className="btn__label">{children}</span>
      {icon && <span className="btn__icon">{icon}</span>}
    </button>
  );
}
