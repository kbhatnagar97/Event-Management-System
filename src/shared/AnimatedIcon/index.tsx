import './index.scss';

interface AnimatedIconProps {
  type: 'success' | 'error' | 'warning';
  size?: number;
}

export function AnimatedIcon({ type, size = 56 }: AnimatedIconProps) {
  if (type === 'success') {
    return (
      <div className="animated-icon" style={{ width: size, height: size }}>
        <svg className="animated-icon__svg" viewBox="0 0 52 52">
          <circle className="animated-icon__ring animated-icon__ring--success" cx="26" cy="26" r="25" fill="none" />
          <path className="animated-icon__tick" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="animated-icon" style={{ width: size, height: size }}>
        <svg className="animated-icon__svg" viewBox="0 0 52 52">
          <circle className="animated-icon__ring animated-icon__ring--error" cx="26" cy="26" r="25" fill="none" />
          <path className="animated-icon__cross" fill="none" d="M16 16l20 20M36 16l-20 20" />
        </svg>
      </div>
    );
  }

  return (
    <div className="animated-icon" style={{ width: size, height: size }}>
      <svg className="animated-icon__svg" viewBox="0 0 52 52">
        <circle className="animated-icon__ring animated-icon__ring--warning" cx="26" cy="26" r="25" fill="none" />
        <path className="animated-icon__tick" fill="none" d="M26 15v14M26 35v2" />
      </svg>
    </div>
  );
}
