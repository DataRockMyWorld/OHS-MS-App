from django.db import models


class AssessmentStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    ACTIVE = 'active', 'Active'
    UNDER_REVIEW = 'under_review', 'Under Review'
    ARCHIVED = 'archived', 'Archived'


class HazardCategory(models.TextChoices):
    PHYSICAL = 'physical', 'Physical'
    CHEMICAL = 'chemical', 'Chemical'
    BIOLOGICAL = 'biological', 'Biological'
    ERGONOMIC = 'ergonomic', 'Ergonomic'
    PSYCHOSOCIAL = 'psychosocial', 'Psychosocial'
    ELECTRICAL = 'electrical', 'Electrical'
    FIRE = 'fire', 'Fire & Explosion'
    ENVIRONMENTAL = 'environmental', 'Environmental'
    MECHANICAL = 'mechanical', 'Mechanical'
    OTHER = 'other', 'Other'


class RiskLevel(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    CRITICAL = 'critical', 'Critical'


def compute_risk_level(rating: int) -> str:
    if rating <= 4:
        return RiskLevel.LOW
    if rating <= 9:
        return RiskLevel.MEDIUM
    if rating <= 16:
        return RiskLevel.HIGH
    return RiskLevel.CRITICAL
