import { useQuery } from '@tanstack/react-query';
import { getLeagueTable } from '../api/objectivesApi';

export function useLeagueTable() {
  return useQuery({
    queryKey: ['league-table'],
    queryFn: getLeagueTable,
    staleTime: 60_000,
  });
}
