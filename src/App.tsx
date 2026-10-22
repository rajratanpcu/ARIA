import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AriaProvider } from './context/AriaContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GuidedDemoModal } from './components/demo/GuidedDemoModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { AgentsPage } from './pages/AgentsPage';
import { BuildIntelligencePage } from './pages/BuildIntelligencePage';
import { CiOrchestrationPage } from './pages/CiOrchestrationPage';
import { ReleaseDeploymentPage } from './pages/ReleaseDeploymentPage';
import { IncidentIntelligencePage } from './pages/IncidentIntelligencePage';
import { AfpProtocolPage } from './pages/AfpProtocolPage';
import { GovernancePage } from './pages/GovernancePage';
import { AuditLogPage } from './pages/AuditLogPage';

export const AppContent: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-150">
      {/* Collapsible Enterprise Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar */}
        <Header onOpenDemoModal={() => setIsDemoModalOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100/60 dark:bg-slate-950 transition-colors duration-150">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/builds" element={<BuildIntelligencePage />} />
              <Route path="/ci-tests" element={<CiOrchestrationPage />} />
              <Route path="/releases" element={<ReleaseDeploymentPage />} />
              <Route path="/incidents" element={<IncidentIntelligencePage />} />
              <Route path="/afp" element={<AfpProtocolPage />} />
              <Route path="/governance" element={<GovernancePage />} />
              <Route path="/audit" element={<AuditLogPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Guided Demo Walkthrough Modal */}
      <GuidedDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AriaProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AriaProvider>
  );
};

export default App;
