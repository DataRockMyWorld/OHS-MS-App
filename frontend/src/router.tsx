import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import RequireAuth from '@/components/auth/RequireAuth';
import LoginPage from '@/features/auth/pages/LoginPage';
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

export const router = createBrowserRouter([
  // ── Public routes ────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
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
        element: <OpenInvestigationPage />,
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
        element: <OpenCAPage />,
      },
      {
        path: 'corrective-actions/:id',
        element: <CADetailPage />,
      },
      {
        path: 'objectives',
        element: <ObjectiveListPage />,
      },
      {
        path: 'objectives/new',
        element: <CreateObjectivePage />,
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
    ],
  },

  // ── Catch-all 404 ─────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
