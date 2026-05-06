from .models import ContextIssue, RiskOrOpportunity


SWOT_TO_CLASSIFICATION = {
    'swot_strength': 'opportunity',
    'swot_weakness': 'risk',
    'swot_opportunity': 'opportunity',
    'swot_threat': 'risk',
}


class ContextService:

    @staticmethod
    def derive_classification(analysis_tag: str, explicit_classification: str) -> str:
        """
        Auto-derive classification from SWOT tags.
        PESTLE_* and OTHER require explicit_classification from the user.
        """
        return SWOT_TO_CLASSIFICATION.get(analysis_tag, explicit_classification)

    @staticmethod
    def get_issue_stats(org_id) -> dict:
        qs = ContextIssue.objects.filter(organization_id=org_id)
        return {
            'total': qs.count(),
            'risks': qs.filter(classification='risk').count(),
            'opportunities': qs.filter(classification='opportunity').count(),
            'open': qs.filter(status='open').count(),
            'monitored': qs.filter(status='monitored').count(),
            'addressed': qs.filter(status='addressed').count(),
            'internal': qs.filter(category='internal').count(),
            'external': qs.filter(category='external').count(),
        }

    @staticmethod
    def get_ro_stats(org_id) -> dict:
        qs = RiskOrOpportunity.objects.filter(organization_id=org_id)
        return {
            'total': qs.count(),
            'risks_count': qs.filter(type='risk').count(),
            'opportunities_count': qs.filter(type='opportunity').count(),
            'open_count': qs.filter(status='open').count(),
            'high_severity': qs.filter(severity_level='high').count(),
            'medium_severity': qs.filter(severity_level='medium').count(),
            'low_severity': qs.filter(severity_level='low').count(),
        }
