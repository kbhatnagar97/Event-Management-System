import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { verifyEmail, register } from '@/api/registration';
import { useRegistrationStore } from '@/stores/registrationStore';
import type { RegistrationPayload } from '@/types/registration';

export function useRegistration() {
  const store = useRegistrationStore();
  const navigate = useNavigate();

  const verify = useMutation({
    mutationFn: (email: string) => verifyEmail(email),
    onSuccess: (data) => {
      if (!data.valid) return;

      if (data.registered && data.guest) {
        // Mock mode — full guest data available → straight to confirmation
        store.setFromGuest(data.guest);
        navigate('/registration/confirmation');
      } else if (data.registered) {
        // Live mode — registered but no guest object from BE
        const names = (data.employeeName || '').split(' ');
        store.setFirstName(names[0] || '');
        store.setLastName(names.slice(1).join(' ') || '');
        store.setIsUpdate(true);
        navigate('/registration/form');
      } else {
        // New user — pre-fill name from employeeName, go to form
        const names = (data.employeeName || '').split(' ');
        store.setFirstName(names[0] || '');
        store.setLastName(names.slice(1).join(' ') || '');
        navigate('/registration/form');
      }
    },
  });

  const submit = useMutation({
    mutationFn: (payload: RegistrationPayload) => register(payload),
    onSuccess: (data) => {
      store.setRegistrationCode(data.code);
      navigate('/registration/confirmation');
    },
  });

  return { verify, submit };
}
