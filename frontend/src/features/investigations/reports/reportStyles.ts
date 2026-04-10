import { StyleSheet } from '@react-pdf/renderer';

// ─── Color tokens ─────────────────────────────────────────────────────────────

export const COLORS = {
  primary:       '#0F766E',
  primaryLight:  '#CCFBF1',
  primaryMid:    '#99F6E4',
  text:          '#0F172A',
  textMuted:     '#64748B',
  textLight:     '#94A3B8',
  surface:       '#F8FAFC',
  surfaceAlt:    '#F1F5F9',
  border:        '#E2E8F0',
  borderLight:   '#F1F5F9',
  white:         '#FFFFFF',
  danger:        '#EF4444',
  dangerLight:   '#FEF2F2',
  warning:       '#F59E0B',
  warningLight:  '#FFFBEB',
  success:       '#10B981',
  successLight:  '#ECFDF5',
  amber:         '#D97706',
};

// ─── Shared document styles ───────────────────────────────────────────────────

export const shared = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 44,
    lineHeight: 1.5,
  },

  // ── Header ──
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  reportSubtitle: {
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
  orgName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  // ── Sections ──
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionTitleSmall: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },

  // ── Cards ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardCell: {
    flex: 1,
    minWidth: 80,
  },
  cellLabel: {
    fontSize: 7.5,
    color: COLORS.textLight,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  cellValue: {
    fontSize: 9,
    color: COLORS.text,
    fontFamily: 'Helvetica-Bold',
  },
  cellValueMuted: {
    fontSize: 9,
    color: COLORS.textMuted,
  },

  // ── Narrative text ──
  narrative: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.7,
    backgroundColor: COLORS.surface,
    borderRadius: 5,
    padding: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  narrativeEmpty: {
    fontSize: 9,
    color: COLORS.textLight,
    fontStyle: 'italic',
    padding: 12,
  },

  // ── Bullet items ──
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 4,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 3.5,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.6,
  },

  // ── Tables ──
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  tableRowAlt: {
    backgroundColor: COLORS.surfaceAlt,
  },
  tableRowOverdue: {
    backgroundColor: COLORS.dangerLight,
  },
  tableCell: {
    fontSize: 8.5,
    color: COLORS.text,
    lineHeight: 1.5,
  },
  tableCellMuted: {
    fontSize: 8.5,
    color: COLORS.textMuted,
  },

  // ── Badges ──
  badge: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.2,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: COLORS.textLight,
  },
  footerTextBold: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textMuted,
  },

  // ── Sign-off grid ──
  signoffRow: {
    flexDirection: 'row',
    gap: 12,
  },
  signoffCell: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  signoffLabel: {
    fontSize: 7.5,
    color: COLORS.textLight,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  signoffName: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
});

// ─── Badge helpers ─────────────────────────────────────────────────────────────

export function severityBadgeStyle(severity: string) {
  const map: Record<string, { bg: string; color: string }> = {
    critical:   { bg: '#FEE2E2', color: '#B91C1C' },
    high:       { bg: '#FEF3C7', color: '#B45309' },
    medium:     { bg: '#E0F2FE', color: '#0369A1' },
    low:        { bg: '#F0FDF4', color: '#15803D' },
  };
  return map[severity?.toLowerCase()] ?? { bg: COLORS.surfaceAlt, color: COLORS.textMuted };
}

export function statusBadgeStyle(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    initiated:               { bg: '#EFF6FF', color: '#1D4ED8' },
    in_progress:             { bg: '#FFF7ED', color: '#C2410C' },
    findings_recorded:       { bg: '#FEF9C3', color: '#A16207' },
    recommendations_issued:  { bg: '#F0FDF4', color: '#166534' },
    closed:                  { bg: COLORS.surfaceAlt, color: COLORS.textMuted },
    // CA statuses
    open:        { bg: '#EFF6FF', color: '#1D4ED8' },
    implemented: { bg: '#F0FDF4', color: '#166534' },
    reopened:    { bg: '#FEF3C7', color: '#B45309' },
  };
  return map[status?.toLowerCase()] ?? { bg: COLORS.surfaceAlt, color: COLORS.textMuted };
}

export function priorityBadgeStyle(priority: string) {
  const map: Record<string, { bg: string; color: string }> = {
    critical: { bg: '#FEE2E2', color: '#B91C1C' },
    high:     { bg: '#FEF3C7', color: '#B45309' },
    medium:   { bg: '#E0F2FE', color: '#0369A1' },
    low:      { bg: '#F0FDF4', color: '#15803D' },
  };
  return map[priority?.toLowerCase()] ?? { bg: COLORS.surfaceAlt, color: COLORS.textMuted };
}

export function formatReportDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function capitalize(str?: string | null): string {
  if (!str) return '—';
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
