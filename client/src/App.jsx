import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GISMapPage from './pages/GISMapPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CompensationPage from './pages/CompensationPage';
import DocumentsPage from './pages/DocumentsPage';
import FieldCapturePage from './pages/FieldCapturePage';
import AssignedParcelsPage from './pages/field/AssignedParcelsPage';
import ParcelVerificationPage from './pages/field/ParcelVerificationPage';
import FieldMapPage from './pages/field/FieldMapPage';
import FieldIssuesPage from './pages/field/FieldIssuesPage';
import FieldPossessionPage from './pages/field/FieldPossessionPage';

// State Government Suite
import StateProjectsPage from './pages/state/StateProjectsPage';
import StateProjectDetailPage from './pages/state/StateProjectDetailPage';
import DistrictPerformancePage from './pages/state/DistrictPerformancePage';
import StateGISMapPage from './pages/state/StateGISMapPage';
import StateApprovalInboxPage from './pages/state/StateApprovalInboxPage';
import StateInterventionPage from './pages/state/StateInterventionPage';
import StateCompensationPage from './pages/state/StateCompensationPage';
import StateRiskAnalysisPage from './pages/state/StateRiskAnalysisPage';
import StateAlertsPage from './pages/state/StateAlertsPage';
import StateReportsPage from './pages/state/StateReportsPage';

// Citizen Dashboard Pages
import CitizenDashboard from './pages/CitizenDashboard/CitizenDashboard';
import MyLandMap from './pages/CitizenDashboard/MyLandMap';
import ParcelDetail from './pages/CitizenDashboard/ParcelDetail';
import CompensationTracker from './pages/CitizenDashboard/CompensationTracker';
import RnRStatus from './pages/CitizenDashboard/RnRStatus';
import ObjectionForm from './pages/CitizenDashboard/ObjectionForm';
import DocumentsList from './pages/CitizenDashboard/DocumentsList';
import { useAuthStore } from './store/authStore';

// Role-aware Home Route
function HomeRoute() {
  const { user } = useAuthStore();
  if (user?.role === 'citizen') {
    return <CitizenDashboard />;
  }
  return <DashboardPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage initialMode="register" />} />

        {/* Protected Application Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRoute />} />

          {/* Citizen Dashboard Sub-Routes */}
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/map" element={<MyLandMap />} />
          <Route path="/citizen/parcels/:id" element={<ParcelDetail />} />
          <Route path="/citizen/compensation" element={<CompensationTracker />} />
          <Route path="/citizen/rnr" element={<RnRStatus />} />
          <Route path="/citizen/objections" element={<ObjectionForm />} />
          <Route path="/citizen/documents" element={<DocumentsList />} />

          {/* Official Administrative Workflow Routes */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/map" element={<GISMapPage />} />
          <Route path="/compensation" element={<CompensationPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/field-capture" element={<FieldCapturePage />} />

          {/* Field Officer Specialized Routes */}
          <Route path="/field/parcels" element={<AssignedParcelsPage />} />
          <Route path="/field/parcels/:id" element={<ParcelVerificationPage />} />
          <Route path="/field/map" element={<FieldMapPage />} />
          <Route path="/field/issues" element={<FieldIssuesPage />} />
          <Route path="/field/possession" element={<FieldPossessionPage />} />

          {/* State Government Sovereign Suite Routes */}
          <Route path="/state/projects" element={<StateProjectsPage />} />
          <Route path="/state/projects/:id" element={<StateProjectDetailPage />} />
          <Route path="/state/districts" element={<DistrictPerformancePage />} />
          <Route path="/state/map" element={<StateGISMapPage />} />
          <Route path="/state/approvals" element={<StateApprovalInboxPage />} />
          <Route path="/state/interventions" element={<StateInterventionPage />} />
          <Route path="/state/compensation" element={<StateCompensationPage />} />
          <Route path="/state/risks" element={<StateRiskAnalysisPage />} />
          <Route path="/state/alerts" element={<StateAlertsPage />} />
          <Route path="/state/reports" element={<StateReportsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

