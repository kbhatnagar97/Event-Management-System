import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegistrationLayout } from '@/features/registration';
import { EmailScreen } from '@/features/registration/components/EmailScreen';
import { FormScreen } from '@/features/registration/components/FormScreen';
import { ConfirmScreen } from '@/features/registration/components/ConfirmScreen';
import { RequireEmail } from '@/shared/RequireEmail';
import { CheckInPage } from '@/features/checkin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/familyday">
        <Routes>
          {/* Registration flow — nested under shared layout */}
          <Route element={<RegistrationLayout />}>
            <Route path="/registration" element={<EmailScreen />} />
            <Route path="/registration/form" element={<RequireEmail><FormScreen /></RequireEmail>} />
            <Route path="/registration/confirmation" element={<RequireEmail><ConfirmScreen /></RequireEmail>} />
          </Route>

          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="*" element={<Navigate to="/registration" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
