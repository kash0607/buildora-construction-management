import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import CreateProjectModal from '../modals/CreateProjectModal';
import QuickReportModal from '../modals/QuickReportModal';
import QuickPOModal from '../modals/QuickPOModal';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [isQuickPOOpen, setIsQuickPOOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-wrapper">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="app-main">
        <Navbar
          onToggleSidebar={toggleSidebar}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenQuickReport={() => setIsQuickReportOpen(true)}
          onOpenQuickPO={() => setIsQuickPOOpen(true)}
        />

        <main className="page-content">
          <div className="content-container">
            <Outlet
              context={{
                openCreateProjectModal: () => setIsCreateProjectOpen(true),
                openQuickReportModal: () => setIsQuickReportOpen(true),
                openQuickPOModal: () => setIsQuickPOOpen(true)
              }}
            />
          </div>
        </main>

        <Footer />
      </div>

      {/* Global Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={() => {
          // Trigger refresh event or state if needed
          window.dispatchEvent(new Event('buildora-data-changed'));
        }}
      />

      <QuickReportModal
        isOpen={isQuickReportOpen}
        onClose={() => setIsQuickReportOpen(false)}
        onReportSubmitted={() => {
          window.dispatchEvent(new Event('buildora-data-changed'));
        }}
      />

      <QuickPOModal
        isOpen={isQuickPOOpen}
        onClose={() => setIsQuickPOOpen(false)}
        onPOSubmitted={() => {
          window.dispatchEvent(new Event('buildora-data-changed'));
        }}
      />
    </div>
  );
}
