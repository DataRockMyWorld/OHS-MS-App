import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestigationCAs } from '../hooks/useInvestigationReport';
import InvestigationReportDocument from './InvestigationReportDocument';
import REXReportDocument from './REXReportDocument';
import type { Investigation } from '../types/investigation.types';

interface Props {
  investigation: Investigation;
  variant: 'investigation' | 'rex';
}

export default function GenerateReportButton({ investigation, variant }: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { data: cas = [] } = useInvestigationCAs(investigation.id);

  const orgName = user?.organization_name ?? 'Organisation';

  async function handleGenerate() {
    setLoading(true);
    try {
      const generatedAt = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      });

      const doc = variant === 'investigation'
        ? (
          <InvestigationReportDocument
            investigation={investigation}
            corrective_actions={cas}
            organizationName={orgName}
            generatedAt={generatedAt}
          />
        )
        : (
          <REXReportDocument
            investigation={investigation}
            organizationName={orgName}
            generatedAt={generatedAt}
          />
        );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = variant === 'investigation'
        ? `investigation-report-${investigation.reference_number}.pdf`
        : `rex-report-${investigation.reference_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  const label = variant === 'investigation' ? 'Investigation Report' : 'REX Report';

  return (
    <Button
      variant="ghost"
      size="sm"
      iconLeft={<DocumentArrowDownIcon className="w-3.5 h-3.5" />}
      loading={loading}
      onClick={handleGenerate}
    >
      {label}
    </Button>
  );
}
