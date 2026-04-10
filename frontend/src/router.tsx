import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import RequireAuth from '@/components/auth/RequireAuth';
import RequireRole from '@/components/auth/RequireRole';
import LoginPage from '@/features/auth/pages/LoginPage';
import TeamPage from '@/features/accounts/pages/TeamPage';
import ProfilePage from '@/features/accounts/pages/ProfilePage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import RiskAssessmentListPage from '@/features/risk_assessments/pages/RiskAssessmentListPage';
import CreateRiskAssessmentPage from '@/features/risk_assessments/pages/CreateRiskAssessmentPage';
import RiskAssessmentDetailPage from '@/features/risk_assessments/pages/RiskAssessmentDetailPage';
import IncidentListPage from '@/features/incidents/pages/IncidentListPage';
import ReportIncidentPage from '@/features/incidents/pages/ReportIncidentPage';
import IncidentDetailPage from '@/features/incidents/pages/IncidentDetailPage';
import StandardPage from '@/features/standard/pages/StandardPage';
import InvestigationListPage from '@/features/investigations/pages/InvestigationListPage';
import OpenInvestigationPage from '@/features/investigations/pages/OpenInvestigationPage';
import InvestigationDetailPage from '@/features/investigations/pages/InvestigationDetailPage';
import CAListPage from '@/features/corrective_actions/pages/CAListPage';
import OpenCAPage from '@/features/corrective_actions/pages/OpenCAPage';
import CADetailPage from '@/features/corrective_actions/pages/CADetailPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ObjectiveListPage from '@/features/objectives/pages/ObjectiveListPage';
import ObjectiveDetailPage from '@/features/objectives/pages/ObjectiveDetailPage';
import CreateObjectivePage from '@/features/objectives/pages/CreateObjectivePage';
import LeagueTablePage from '@/features/objectives/pages/LeagueTablePage';
import ContextRegisterPage from '@/features/context/pages/ContextRegisterPage';
import CreateIssuePage from '@/features/context/pages/CreateIssuePage';
import IssueDetailPage from '@/features/context/pages/IssueDetailPage';
import CreateInterestedPartyPage from '@/features/context/pages/CreateInterestedPartyPage';
import InterestedPartyDetailPage from '@/features/context/pages/InterestedPartyDetailPage';
import CreateRiskOpportunityPage from '@/features/context/pages/CreateRiskOpportunityPage';
import RiskOpportunityDetailPage from '@/features/context/pages/RiskOpportunityDetailPage';
import AuditListPage from '@/features/audits/pages/AuditListPage';
import CreateAuditPage from '@/features/audits/pages/CreateAuditPage';
import AuditDetailPage from '@/features/audits/pages/AuditDetailPage';
import AnonymousReportPage from '@/pages/AnonymousReportPage';
import LegalRegisterPage from '@/features/legal/pages/LegalRegisterPage';
import CreateLegalRequirementPage from '@/features/legal/pages/CreateLegalRequirementPage';
import LegalRequirementDetailPage from '@/features/legal/pages/LegalRequirementDetailPage';

export const router = createBrowserRouter([
  // ── Public routes ────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/report/:orgSlug',
    element: <AnonymousReportPage />,
  },

  // ── Protected routes ─────────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'incidents',
        element: <IncidentListPage />,
      },
      {
        path: 'incidents/new',
        element: <ReportIncidentPage />,
      },
      {
        path: 'incidents/:id',
        element: <IncidentDetailPage />,
      },
      {
        path: 'investigations',
        element: <InvestigationListPage />,
      },
      {
        path: 'investigations/new',
        element: <RequireRole minRole="supervisor"><OpenInvestigationPage /></RequireRole>,
      },
      {
        path: 'investigations/:id',
        element: <InvestigationDetailPage />,
      },
      {
        path: 'corrective-actions',
        element: <CAListPage />,
      },
      {
        path: 'corrective-actions/new',
        element: <RequireRole minRole="supervisor"><OpenCAPage /></RequireRole>,
      },
      {
        path: 'corrective-actions/:id',
        element: <CADetailPage />,
      },
      {
        path: 'context',
        element: <RequireRole minRole="supervisor"><ContextRegisterPage /></RequireRole>,
      },
      {
        path: 'context/issues/new',
        element: <RequireRole minRole="hse_manager"><CreateIssuePage /></RequireRole>,
      },
      {
        path: 'context/issues/:id',
        element: <RequireRole minRole="supervisor"><IssueDetailPage /></RequireRole>,
      },
      {
        path: 'context/interested-parties/new',
        element: <RequireRole minRole="hse_manager"><CreateInterestedPartyPage /></RequireRole>,
      },
      {
        path: 'context/interested-parties/:id',
        element: <RequireRole minRole="supervisor"><InterestedPartyDetailPage /></RequireRole>,
      },
      {
        path: 'context/risks-and-opportunities/new',
        element: <RequireRole minRole="hse_manager"><CreateRiskOpportunityPage /></RequireRole>,
      },
      {
        path: 'context/risks-and-opportunities/:id',
        element: <RequireRole minRole="supervisor"><RiskOpportunityDetailPage /></RequireRole>,
      },
      {
        path: 'objectives',
        element: <ObjectiveListPage />,
      },
      {
        path: 'objectives/new',
        element: <RequireRole minRole="hse_manager"><CreateObjectivePage /></RequireRole>,
      },
      {
        path: 'objectives/league-table',
        element: <LeagueTablePage />,
      },
      {
        path: 'objectives/:id',
        element: <ObjectiveDetailPage />,
      },
      {
        path: 'standard',
        element: <StandardPage />,
      },
      {
        path: 'standard/:clauseId',
        element: <StandardPage />,
      },
      {
        path: 'team',
        element: <RequireRole minRole="supervisor"><TeamPage /></RequireRole>,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'reports',
        element: <RequireRole minRole="supervisor"><ReportsPage /></RequireRole>,
      },
      {
        path: 'risk-assessments',
        element: <RequireRole minRole="supervisor"><RiskAssessmentListPage /></RequireRole>,
      },
      {
        path: 'risk-assessments/new',
        element: <RequireRole minRole="hse_manager"><CreateRiskAssessmentPage /></RequireRole>,
      },
      {
        path: 'risk-assessments/:id',
        element: <RequireRole minRole="supervisor"><RiskAssessmentDetailPage /></RequireRole>,
      },
      {
        path: 'audits',
        element: <RequireRole minRole="supervisor"><AuditListPage /></RequireRole>,
      },
      {
        path: 'audits/new',
        element: <RequireRole minRole="hse_manager"><CreateAuditPage /></RequireRole>,
      },
      {
        path: 'audits/:id',
        element: <RequireRole minRole="supervisor"><AuditDetailPage /></RequireRole>,
      },
      {
        path: 'legal',
        element: <RequireRole minRole="supervisor"><LegalRegisterPage /></RequireRole>,
      },
      {
        path: 'legal/new',
        element: <RequireRole minRole="hse_manager"><CreateLegalRequirementPage /></RequireRole>,
      },
      {
        path: 'legal/:id',
        element: <RequireRole minRole="supervisor"><LegalRequirementDetailPage /></RequireRole>,
      },
    ],
  },

  // ── Catch-all 404 ─────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
