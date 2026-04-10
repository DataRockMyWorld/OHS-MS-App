import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import {
  shared,
  COLORS,
  formatReportDate,
  capitalize,
} from './reportStyles';
import type { Investigation } from '../types/investigation.types';

// ─── Local styles ─────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  // REX has a bolder header
  rexHeader: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rexHeaderTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rexHeaderSub: {
    fontSize: 8.5,
    color: '#99F6E4',
    letterSpacing: 0.3,
  },
  rexHeaderMeta: {
    alignItems: 'flex-end',
  },
  rexHeaderMetaLabel: {
    fontSize: 7.5,
    color: '#99F6E4',
    letterSpacing: 0.2,
    marginBottom: 1,
  },
  rexHeaderMetaValue: {
    fontSize: 9,
    color: COLORS.white,
    fontFamily: 'Helvetica-Bold',
  },

  // Overview strip
  overviewStrip: {
    flexDirection: 'row',
    gap: 1,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  overviewCell: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
  },

  // Key learning cards — most prominent section
  learningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 12,
    marginBottom: 7,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  learningIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  learningIndexText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  learningText: {
    flex: 1,
    fontSize: 9.5,
    color: COLORS.text,
    lineHeight: 1.6,
    fontFamily: 'Helvetica-Bold',
  },

  // Root cause simplified
  rcSimple: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  rcSimpleText: {
    fontSize: 9.5,
    color: COLORS.text,
    lineHeight: 1.7,
  },

  // What went wrong / right
  wrongCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  wrongDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginTop: 2.5,
    marginRight: 8,
    flexShrink: 0,
  },
  rightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginTop: 2.5,
    marginRight: 8,
    flexShrink: 0,
  },
  factText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.6,
  },

  // Two-column layout for wrong/right
  twoCol: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  col: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  colHeaderWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FEE2E2',
  },
  colHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1FAE5',
  },
  colTitleWrong: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  colTitleRight: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  colAccentWrong: {
    width: 3,
    height: 12,
    backgroundColor: COLORS.danger,
    borderRadius: 2,
    marginRight: 6,
  },
  colAccentRight: {
    width: 3,
    height: 12,
    backgroundColor: COLORS.success,
    borderRadius: 2,
    marginRight: 6,
  },

  // Action list
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
    backgroundColor: COLORS.surface,
    borderRadius: 5,
    padding: 10,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  actionNum: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    width: 18,
    marginTop: 0.5,
  },
  actionText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.6,
  },

  // Safety message — highlight box
  safetyBox: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 18,
    marginTop: 16,
    marginBottom: 16,
  },
  safetyBoxLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#99F6E4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  safetyBoxText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    lineHeight: 1.6,
    letterSpacing: 0.1,
  },
  safetyBoxSub: {
    fontSize: 8.5,
    color: '#CCFBF1',
    marginTop: 6,
    lineHeight: 1.5,
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function REXSectionHeader({ title }: { title: string }) {
  return (
    <View style={shared.sectionHeader}>
      <View style={shared.sectionAccent} />
      <Text style={shared.sectionTitle}>{title}</Text>
    </View>
  );
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <View style={[shared.badge, { backgroundColor: bg }]}>
      <Text style={[shared.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function LearningCards({ text }: { text?: string | null }) {
  if (!text) {
    return (
      <Text style={shared.narrativeEmpty}>
        No lessons learned recorded for this investigation.
      </Text>
    );
  }

  const lines = text
    .split('\n')
    .map(l => l.replace(/^[-•*]\d*\.?\s*/, '').trim())
    .filter(Boolean);

  return (
    <View>
      {lines.map((line, i) => (
        <View key={i} style={S.learningCard}>
          <View style={S.learningIndex}>
            <Text style={S.learningIndexText}>{i + 1}</Text>
          </View>
          <Text style={S.learningText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function FactList({
  text,
  dotStyle,
}: {
  text?: string | null;
  dotStyle: 'wrong' | 'right';
}) {
  if (!text) return <Text style={shared.narrativeEmpty}>Not recorded.</Text>;

  const lines = text
    .split('\n')
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  return (
    <View>
      {lines.map((line, i) => (
        <View key={i} style={S.wrongCard}>
          <View style={dotStyle === 'wrong' ? S.wrongDot : S.rightDot} />
          <Text style={S.factText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function ActionList({ text }: { text?: string | null }) {
  if (!text) return <Text style={shared.narrativeEmpty}>No recommendations recorded.</Text>;

  const lines = text
    .split('\n')
    .map(l => l.replace(/^[-•*]\d*\.?\s*/, '').trim())
    .filter(Boolean);

  return (
    <View>
      {lines.map((line, i) => (
        <View key={i} style={S.actionRow}>
          <Text style={S.actionNum}>{`${i + 1}.`}</Text>
          <Text style={S.actionText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function PageFooter({
  investigation,
  generatedAt,
}: {
  investigation: Investigation;
  generatedAt: string;
}) {
  return (
    <View style={shared.footer} fixed>
      <Text style={shared.footerText}>
        {`REX Report · ${investigation.reference_number}`}
      </Text>
      <Text
        style={shared.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
      <Text style={shared.footerText}>{`Generated ${generatedAt}`}</Text>
    </View>
  );
}

// ─── Main document ────────────────────────────────────────────────────────────

interface Props {
  investigation: Investigation;
  organizationName: string;
  generatedAt?: string;
}

export default function REXReportDocument({
  investigation,
  organizationName,
  generatedAt,
}: Props) {
  const dateStr = generatedAt ?? new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // Build safety message from lessons_learned first line or recommendations
  const safetyMessage = (() => {
    const src = investigation.lessons_learned || investigation.recommendations || '';
    const firstLine = src.split('\n').find(l => l.trim());
    return firstLine?.replace(/^[-•*]\s*/, '').trim() || 'Safety is built through shared learning and continuous improvement.';
  })();

  return (
    <Document
      title={`REX Report — ${investigation.reference_number}`}
      author={organizationName}
    >
      <Page size="A4" style={shared.page}>
        <PageFooter investigation={investigation} generatedAt={dateStr} />

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <View style={S.rexHeader}>
          <View>
            <Text style={S.rexHeaderTitle}>Return on Experience</Text>
            <Text style={S.rexHeaderSub}>
              Safety Learning Report · ISO 45001 Aligned
            </Text>
            <View style={{ marginTop: 10, flexDirection: 'row', gap: 6 }}>
              {investigation.incident?.severity && (
                <Badge
                  label={`Severity: ${capitalize(investigation.incident.severity)}`}
                  bg="rgba(255,255,255,0.15)"
                  color={COLORS.white}
                />
              )}
              <Badge
                label={investigation.reference_number}
                bg="rgba(255,255,255,0.15)"
                color={COLORS.white}
              />
            </View>
          </View>
          <View style={S.rexHeaderMeta}>
            <Text style={S.rexHeaderMetaLabel}>Organization</Text>
            <Text style={S.rexHeaderMetaValue}>{organizationName}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={S.rexHeaderMetaLabel}>Date</Text>
              <Text style={S.rexHeaderMetaValue}>{dateStr}</Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={S.rexHeaderMetaLabel}>Lead Investigator</Text>
              <Text style={S.rexHeaderMetaValue}>
                {investigation.lead_investigator?.full_name ?? '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 1. INCIDENT OVERVIEW ────────────────────────────────────────── */}
        <View style={shared.section}>
          <REXSectionHeader title="Incident Overview" />

          {/* Incident title */}
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: COLORS.text, marginBottom: 10 }}>
            {investigation.incident?.title ?? investigation.title}
          </Text>

          {/* Strip */}
          <View style={S.overviewStrip}>
            {[
              { label: 'Date',       value: formatReportDate(investigation.incident?.date_of_incident) },
              { label: 'Severity',   value: capitalize(investigation.incident?.severity) },
              { label: 'RCA Method', value: investigation.rca_method_display ?? '—' },
              { label: 'Ref.',       value: investigation.incident?.reference_number ?? '—' },
            ].map((c, i) => (
              <View key={i} style={S.overviewCell}>
                <Text style={shared.cellLabel}>{c.label}</Text>
                <Text style={shared.cellValue}>{c.value}</Text>
              </View>
            ))}
          </View>

          {/* Short description — scope as context */}
          {investigation.scope && (
            <View style={shared.narrative}>
              <Text>{investigation.scope}</Text>
            </View>
          )}
        </View>

        <View style={shared.divider} />

        {/* ── 2. KEY LEARNING POINTS ──────────────────────────────────────── */}
        <View style={shared.section}>
          <REXSectionHeader title="Key Learning Points" />
          <Text style={{ fontSize: 8.5, color: COLORS.textMuted, marginBottom: 10 }}>
            Critical insights derived from this investigation to improve safety practices.
          </Text>
          <LearningCards text={investigation.lessons_learned} />
        </View>

        <View style={shared.divider} />

        {/* ── 3. ROOT CAUSE (SIMPLIFIED) ──────────────────────────────────── */}
        <View style={shared.section}>
          <REXSectionHeader title="Root Cause — What Caused This?" />
          {investigation.root_causes?.length > 0 ? (
            <View>
              {investigation.root_causes.slice(0, 3).map((rc) => (
                <View key={rc.id} style={[S.rcSimple, { marginBottom: 8 }]}>
                  <Text style={{ fontSize: 7.5, color: COLORS.primary, fontFamily: 'Helvetica-Bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {rc.category_display}
                  </Text>
                  <Text style={S.rcSimpleText}>{rc.description}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={S.rcSimple}>
              <Text style={S.rcSimpleText}>
                {investigation.contributing_factors || 'Root cause analysis is ongoing.'}
              </Text>
            </View>
          )}
        </View>

        <View style={shared.divider} />

        {/* ── 4. WHAT WENT WRONG / WHAT WENT WELL ────────────────────────── */}
        <View style={shared.section}>
          <REXSectionHeader title="Analysis" />
          <View style={S.twoCol}>
            {/* What went wrong */}
            <View style={S.col}>
              <View style={S.colHeaderWrong}>
                <View style={S.colAccentWrong} />
                <Text style={S.colTitleWrong}>What Went Wrong</Text>
              </View>
              <FactList text={investigation.immediate_causes} dotStyle="wrong" />
            </View>

            {/* What went well */}
            <View style={S.col}>
              <View style={S.colHeaderRight}>
                <View style={S.colAccentRight} />
                <Text style={S.colTitleRight}>What Went Well</Text>
              </View>
              <FactList text={investigation.findings} dotStyle="right" />
            </View>
          </View>
        </View>

        <View style={shared.divider} />

        {/* ── 5. RECOMMENDED ACTIONS ──────────────────────────────────────── */}
        <View style={shared.section}>
          <REXSectionHeader title="Recommended Actions" />
          <Text style={{ fontSize: 8.5, color: COLORS.textMuted, marginBottom: 10 }}>
            Actions to prevent recurrence and improve safety systems.
          </Text>
          <ActionList text={investigation.recommendations} />
        </View>

        {/* ── 6. SAFETY MESSAGE ───────────────────────────────────────────── */}
        <View style={S.safetyBox}>
          <Text style={S.safetyBoxLabel}>Key Safety Message</Text>
          <Text style={S.safetyBoxText}>{safetyMessage}</Text>
          <Text style={S.safetyBoxSub}>
            Share this report with your team to build a stronger safety culture.
          </Text>
        </View>

        {/* ── FOOTER ATTRIBUTION ──────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View>
            <Text style={shared.metaText}>
              {`Prepared by: ${investigation.lead_investigator?.full_name ?? '—'}`}
            </Text>
            {investigation.lead_investigator?.job_title && (
              <Text style={shared.metaText}>
                {investigation.lead_investigator.job_title}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={shared.metaText}>
              {investigation.closed_at
                ? `Closed: ${formatReportDate(investigation.closed_at)}`
                : 'Investigation ongoing'}
            </Text>
            <Text style={shared.metaText}>{organizationName}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
