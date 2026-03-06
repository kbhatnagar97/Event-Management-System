import { Navigate } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/registrationStore';
import { isDeloitteEmail } from '@/lib/helpers';

/**
 * Route guard — redirects to /registration if there's no
 * valid @deloitte.com email in the registration store.
 */
export function RequireEmail({ children }: { children: React.ReactNode }) {
  const email = useRegistrationStore((s) => s.email);

  if (!isDeloitteEmail(email)) {
    return <Navigate to="/registration" replace />;
  }

  return <>{children}</>;
}
