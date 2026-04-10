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
  severityBadgeStyle,
  statusBadgeStyle,
  priorityBadgeStyle,
  formatReportDate,
  capitalize,
} from './reportStyles';
import type { Investigation } from '../types/investigation.types';
import type { CorrectiveAction } from '../../corrective_actions/types/ca.types';

// ─── Local styles ─────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  // Summary grid — 3 cols × 2 rows
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  summaryCell: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.white,
    padding: 10,
  },

  // Root cause item
  rcCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 10,
    paddingVertical: 8,
    paddingRight: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  rcCategory: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  rcDesc: {
    fontSize: 8.5,
    color: COLORS.text,
    lineHeight: 1.6,
    marginBottom: 6,
  },
  whyLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  whyItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 2,
  },
  whyNum: {
    fontSize: 8,
    color: COLORS.primary,
    fontFamily: 'Helvetica-Bold',
    width: 16,
  },
  whyText: {
    flex: 1,
    fontSize: 8,
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },

  // CA table columns widths
  colDesc:    { flex: 2.8 },
  colType:    { flex: 1 },
  colPerson:  { flex: 1.2 },
  colDue:     { flex: 0.9 },
  colStatus:  { flex: 0.9 },

  // Sign-off footer
  signoffSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Conclusion box
  conclusionBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.primaryMid,
  },
  conclusionText: {
    fontSize: 9,
    color: '#134E4A',
    lineHeight: 1.7,
  },

  // Overdue flag
  overdueFlag: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.danger,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    marginLeft: 4,
    alignSelf: 'center',
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={shared.sectionHeader}>
      <View style={shared.sectionAccent} />
      <Text style={shared.sectionTitle}>{title}</Text>
    </View>
  );
}

function Badge({
  label, bg, color,
}: { label: string; bg: string; color: string }) {
  return (
    <View style={[shared.badge, { backgroundColor: bg }]}>
      <Text style={[shared.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function SummaryGrid({ investigation }: { investigation: Investigation }) {
  const cells = [
    { label: 'Investigation ID',   value: investigation.reference_number },
    { label: 'Incident ID',         value: investigation.incident?.reference_number ?? '—' },
    { label: 'Status',              value: investigation.status_display },
    { label: 'Date of Incident',    value: formatReportDate(investigation.incident?.date_of_incident) },
    { label: 'RCA Method',          value: investigation.rca_method_display ?? '—' },
    { label: 'Target Completion',   value: formatReportDate(investigation.target_completion_date) },
    { label: 'Lead Investigator',   value: investigation.lead_investigator?.full_name ?? '—' },
    { label: 'Incident Severity',   value: capitalize(investigation.incident?.severity) },
    { label: 'Actual Completion',   value: formatReportDate(investigation.actual_completion_date) },
  ];

  return (
    <View style={S.summaryGrid}>
      {cells.map((c, i) => (
        <View key={i} style={S.summaryCell}>
          <Text style={shared.cellLabel}>{c.label}</Text>
          <Text style={shared.cellValue}>{c.value || '—'}</Text>
        </View>
      ))}
    </View>
  );
}

function NarrativeBlock({ label, value }: { label?: string; value?: string | null }) {
  return (
    <View style={{ marginBottom: 10 }}>
      {label && (
        <Text style={[shared.cellLabel, { marginBottom: 5 }]}>{label}</Text>
      )}
      {value ? (
        <View style={shared.narrative}>
          <Text>{value}</Text>
        </View>
      ) : (
        <Text style={shared.narrativeEmpty}>Not provided</Text>
      )}
    </View>
  );
}

function BulletList({ text }: { text?: string | null }) {
  if (!text) return <Text style={shared.narrativeEmpty}>Not provided</Text>;
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <View>
      {lines.map((line, i) => (
        <View key={i} style={shared.bulletRow}>
          <View style={shared.bullet} />
          <Text style={shared.bulletText}>{line.replace(/^[-•*]\s*/, '')}</Text>
        </View>
      ))}
    </View>
  );
}

function RootCauseSection({ investigation }: { investigation: Investigation }) {
  if (!investigation.root_causes?.length) {
    return <Text style={shared.narrativeEmpty}>No root causes recorded.</Text>;
  }
  return (
    <View>
      {investigation.root_causes.map((rc, i) => (
        <View key={rc.id} style={S.rcCard}>
          <Text style={S.rcCategory}>
            {`RC-${i + 1}  ·  ${rc.category_display}`}
          </Text>
          <Text style={S.rcDesc}>{rc.description}</Text>
          {rc.why_analysis?.length > 0 && (
            <View>
              <Text style={S.whyLabel}>Why Analysis</Text>
              {rc.why_analysis.map((why, wi) => (
                <View key={wi} style={S.whyItem}>
                  <Text style={S.whyNum}>{`W${wi + 1}.`}</Text>
                  <Text style={S.whyText}>{why}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function CATable({ cas }: { cas: CorrectiveAction[] }) {
  if (!cas.length) {
    return (
      <Text style={shared.narrativeEmpty}>
        No corrective actions linked to this investigation.
      </Text>
    );
  }

  return (
    <View>
      {/* Header */}
      <View style={shared.tableHeader}>
        <Text style={[shared.tableHeaderCell, S.colDesc]}>Action</Text>
        <Text style={[shared.tableHeaderCell, S.colType]}>Type</Text>
        <Text style={[shared.tableHeaderCell, S.colPerson]}>Responsible</Text>
        <Text style={[shared.tableHeaderCell, S.colDue]}>Due</Text>
        <Text style={[shared.tableHeaderCell, S.colStatus]}>Status</Text>
      </View>

      {/* Rows */}
      {cas.map((ca, i) => {
        const isOverdue = ca.is_overdue;
        const rowStyle = isOverdue
          ? [shared.tableRow, shared.tableRowOverdue]
          : i % 2 === 1
          ? [shared.tableRow, shared.tableRowAlt]
          : [shared.tableRow];
        const statusStyle = statusBadgeStyle(ca.status);
        const prioStyle = priorityBadgeStyle(ca.priority);

        return (
          <View key={ca.id} style={rowStyle}>
            {/* Description col */}
            <View style={[S.colDesc, { paddingRight: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={[shared.tableCell, { fontFamily: 'Helvetica-Bold' }]}>
                  {ca.reference_number}
                </Text>
                {isOverdue && <Text style={S.overdueFlag}>OVERDUE</Text>}
              </View>
              <Text style={shared.tableCell}>{ca.title}</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                <Badge label={capitalize(ca.priority)} bg={prioStyle.bg} color={prioStyle.color} />
              </View>
            </View>
            {/* Type */}
            <View style={S.colType}>
              <Text style={shared.tableCellMuted}>{capitalize(ca.action_type)}</Text>
            </View>
            {/* Responsible */}
            <View style={S.colPerson}>
              <Text style={shared.tableCell}>
                {ca.assigned_to?.full_name ?? '—'}
              </Text>
            </View>
            {/* Due date */}
            <View style={S.colDue}>
              <Text style={[shared.tableCell, isOverdue ? { color: COLORS.danger } : {}]}>
                {formatReportDate(ca.target_date)}
              </Text>
            </View>
            {/* Status */}
            <View style={S.colStatus}>
              <Badge
                label={capitalize(ca.status)}
                bg={statusStyle.bg}
                color={statusStyle.color}
              />
            </View>
          </View>
        );
      })}
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
        {`Investigation Report · ${investigation.reference_number}`}
      </Text>
      <Text style={shared.footerText} render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages}`
      } />
      <Text style={shared.footerText}>{`Generated ${generatedAt}`}</Text>
    </View>
  );
}

// ─── Main document ────────────────────────────────────────────────────────────

interface Props {
  investigation: Investigation;
  corrective_actions: CorrectiveAction[];
  organizationName: string;
  generatedAt?: string;
}

export default function InvestigationReportDocument({
  investigation,
  corrective_actions,
  organizationName,
  generatedAt,
}: Props) {
  const dateStr = generatedAt ?? new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const sevStyle = investigation.incident?.severity
    ? severityBadgeStyle(investigation.incident.severity)
    : { bg: COLORS.surfaceAlt, color: COLORS.textMuted };
  const stStatus = statusBadgeStyle(investigation.status);

  return (
    <Document
      title={`Investigation Report — ${investigation.reference_number}`}
      author={organizationName}
    >
      <Page size="A4" style={shared.page}>

        {/* ── PAGE FOOTER (fixed) ──────────────────────────────────────────── */}
        <PageFooter investigation={investigation} generatedAt={dateStr} />

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <View style={shared.headerRow}>
          <View style={shared.headerLeft}>
            <Text style={shared.reportTitle}>Incident Investigation Report</Text>
            <Text style={shared.reportSubtitle}>
              ISO 45001-aligned · Occupational Health &amp; Safety
            </Text>
          </View>
          <View style={shared.headerRight}>
            <Text style={shared.orgName}>{organizationName}</Text>
            <Text style={shared.metaText}>{`Ref: ${investigation.reference_number}`}</Text>
            <Text style={shared.metaText}>{`Generated: ${dateStr}`}</Text>
          </View>
        </View>

        {/* ── 1. INCIDENT SUMMARY ─────────────────────────────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Incident Summary" />
          <Text
            style={[
              shared.cellValue,
              { fontSize: 13, marginBottom: 10, lineHeight: 1.3 },
            ]}
          >
            {investigation.incident?.title ?? investigation.title}
          </Text>

          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
            {investigation.incident?.severity && (
              <Badge
                label={`Severity: ${capitalize(investigation.incident.severity)}`}
                bg={sevStyle.bg}
                color={sevStyle.color}
              />
            )}
            <Badge
              label={`Status: ${investigation.status_display}`}
              bg={stStatus.bg}
              color={stStatus.color}
            />
            {investigation.is_overdue && (
              <Badge label="Overdue" bg={COLORS.dangerLight} color={COLORS.danger} />
            )}
          </View>

          <SummaryGrid investigation={investigation} />
        </View>

        <View style={shared.divider} />

        {/* ── 2. INVESTIGATION SCOPE ──────────────────────────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Investigation Scope" />
          <NarrativeBlock value={investigation.scope} />
        </View>

        {/* ── 3. TIMELINE OF EVENTS ───────────────────────────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Timeline of Events" />
          <NarrativeBlock value={investigation.timeline_of_events} />
        </View>

        <View style={shared.divider} />

        {/* ── 4. IMMEDIATE CAUSES & CONTRIBUTING FACTORS ─────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Immediate Causes" />
          <BulletList text={investigation.immediate_causes} />
        </View>

        <View style={[shared.section, { marginTop: 4 }]}>
          <SectionHeader title="Contributing Factors" />
          <BulletList text={investigation.contributing_factors} />
        </View>

        <View style={shared.divider} />

        {/* ── 5. ROOT CAUSE ANALYSIS ──────────────────────────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Root Cause Analysis" />
          {investigation.rca_method && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[shared.cellLabel, { marginBottom: 0, marginRight: 6 }]}>
                Method:
              </Text>
              <Text style={[shared.cellValue, { fontSize: 8.5 }]}>
                {investigation.rca_method_display}
              </Text>
            </View>
          )}
          <RootCauseSection investigation={investigation} />
        </View>

        <View style={shared.divider} />

        {/* ── 6. FINDINGS ─────────────────────────────────────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Findings" />
          <NarrativeBlock value={investigation.findings} />
        </View>

        {/* ── 7. CORRECTIVE & PREVENTIVE ACTIONS ─────────────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Corrective &amp; Preventive Actions" />
          <CATable cas={corrective_actions} />
        </View>

        <View style={shared.divider} />

        {/* ── 8. RECOMMENDATIONS & LESSONS LEARNED ───────────────────────── */}
        <View style={shared.section}>
          <SectionHeader title="Recommendations" />
          <BulletList text={investigation.recommendations} />
        </View>

        <View style={[shared.section, { marginTop: 4 }]}>
          <SectionHeader title="Lessons Learned" />
          <View style={S.conclusionBox}>
            <Text style={S.conclusionText}>
              {investigation.lessons_learned || 'Not yet recorded.'}
            </Text>
          </View>
        </View>

        <View style={shared.divider} />

        {/* ── 9. SIGN-OFF ─────────────────────────────────────────────────── */}
        <View style={S.signoffSection}>
          <SectionHeader title="Approval &amp; Sign-off" />
          <View style={shared.signoffRow}>
            <View style={shared.signoffCell}>
              <Text style={shared.signoffLabel}>Prepared by</Text>
              <Text style={shared.signoffName}>
                {investigation.created_by?.full_name ?? '—'}
              </Text>
              <Text style={shared.metaText}>
                {investigation.created_by?.job_title ?? ''}
              </Text>
            </View>
            <View style={shared.signoffCell}>
              <Text style={shared.signoffLabel}>Lead Investigator</Text>
              <Text style={shared.signoffName}>
                {investigation.lead_investigator?.full_name ?? '—'}
              </Text>
              <Text style={shared.metaText}>
                {investigation.lead_investigator?.job_title ?? ''}
              </Text>
            </View>
            <View style={shared.signoffCell}>
              <Text style={shared.signoffLabel}>Closed by</Text>
              <Text style={shared.signoffName}>
                {investigation.closed_by?.full_name ?? '—'}
              </Text>
              <Text style={shared.metaText}>
                {investigation.closed_at ? formatReportDate(investigation.closed_at) : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
