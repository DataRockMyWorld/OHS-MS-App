import { useQuery } from '@tanstack/react-query';
import { correctiveActionsApi } from '@/features/corrective_actions/api/correctiveActionsApi';
import type { CorrectiveAction } from '@/features/corrective_actions/types/ca.types';

/**
 * Fetches all corrective actions linked to a given investigation.
 * Used by the report generation flow to get CA data without
 * modifying the investigation detail serializer.
 */
export function useInvestigationCAs(investigationId: string) {
  return useQuery({
    queryKey: ['investigation-cas', investigationId],
    queryFn: async (): Promise<CorrectiveAction[]> => {
      // Fetch without pagination limit — reports need all CAs
      const response = await correctiveActionsApi.list({
        source_investigation: investigationId,
      });
      // The API returns a paginated response — resolve all items
      const items = Array.isArray(response)
        ? response
        : (response as any).results ?? [];
      return items;
    },
    enabled: !!investigationId,
    staleTime: 60_000,
  });
}
