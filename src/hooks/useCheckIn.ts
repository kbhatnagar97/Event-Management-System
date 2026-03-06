import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInGuest, undoCheckIn } from '@/api/checkin';
import { QUERY_KEYS } from '@/lib/constants';
import type { CheckInPayload } from '@/types/checkin';

export function useCheckIn() {
  const queryClient = useQueryClient();

  const checkIn = useMutation({
    mutationFn: (payload: CheckInPayload) => checkInGuest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
    },
  });

  const undo = useMutation({
    mutationFn: (guestId: string) => undoCheckIn(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
    },
  });

  return { checkIn, undo };
}
