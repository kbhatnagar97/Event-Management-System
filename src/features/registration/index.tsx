import { Outlet } from 'react-router-dom';
import './index.scss';

export function RegistrationLayout() {
  return (
    <div className="reg-page">
      <div className="bg-ambient">
        <div className="bg-glow" />
        <div className="bg-glow-2" />
      </div>

      <main className="reg-container">
        <Outlet />
      </main>
    </div>
  );
}
