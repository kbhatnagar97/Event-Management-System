import { useQuery } from '@tanstack/react-query';
import { searchGuests, getStats } from '@/api/checkin';
import { useCheckInStore } from '@/stores/checkInStore';
import { QUERY_KEYS } from '@/lib/constants';

export function useGuestSearch() {
  const { searchQuery, searchFilter } = useCheckInStore();

  return useQuery({
    queryKey: [QUERY_KEYS.guests, { q: searchQuery, filter: searchFilter }],
    queryFn: () => searchGuests({ q: searchQuery, filter: searchFilter }),
    placeholderData: (prev) => prev,
  });
}

export function useCheckInStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.stats],
    queryFn: getStats,
    refetchInterval: 30_000,
  });
}
