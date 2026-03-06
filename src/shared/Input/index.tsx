import type { InputHTMLAttributes } from 'react';
import type { ReactNode } from 'react';
import './index.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  floating?: boolean;
  error?: string;
}

export function Input({ label, icon, floating, error, className = '', id, ...rest }: InputProps) {
  const errorId = id ? `${id}-error` : undefined;

  if (floating) {
    return (
      <div className={`field-float ${error ? 'field-float--error' : ''} ${className}`}>
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error && errorId ? errorId : undefined}
          {...rest}
          placeholder=" "
        />
        {label && <label htmlFor={id}>{label}</label>}
        {error && <span id={errorId} className="field-float__error" role="alert">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <div className="field__wrapper">
        {icon && <span className="field__icon">{icon}</span>}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error && errorId ? errorId : undefined}
          {...rest}
        />
      </div>
      {error && <span id={errorId} className="field__error" role="alert">{error}</span>}
    </div>
  );
}
