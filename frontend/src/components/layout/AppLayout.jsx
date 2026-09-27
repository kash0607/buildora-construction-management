import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import PageLoader from '../common/PageLoader';
import CreateProjectModal from '../modals/CreateProjectModal';
import QuickReportModal from '../modals/QuickReportModal';
import QuickPOModal from '../modals/QuickPOModal';

function getRouteMetadata(pathname) {
  if (pathname.includes('/projects/') && pathname !== '/projects') {
    return {
      text: 'Loading Project Workspace...',
      subtext: 'Retrieving project milestones, tasks & financial ledger'
    };
  }
  if (pathname.startsWith('/projects')) {
    return {
      text: 'Loading Projects Portfolio...',
      subtext: 'Accessing active infrastructure sites and budgets'
    };
  }
  if (pathname.startsWith('/tasks')) {
    return {
      text: 'Loading Task Schedules...',
      subtext: 'Calculating critical path timeline and dependencies'
    };
  }
  if (pathname.startsWith('/site-reports')) {
    return {
      text: 'Loading Daily Field Logs...',
      subtext: 'Synchronizing site reports, manpower & weather telemetry'
    };
  }
  if (pathname.startsWith('/issues')) {
    return {
      text: 'Loading Safety & QA Issues...',
      subtext: 'Retrieving punch list, risk logs & open inspections'
    };
  }
  if (pathname.startsWith('/approvals')) {
    return {
      text: 'Loading Commercial Approvals...',
      subtext: 'Verifying purchase orders, change requests & compliance'
    };
  }
  if (pathname.startsWith('/materials')) {
    return {
      text: 'Loading Materials Catalog...',
      subtext: 'Updating material requisitions and specifications'
    };
  }
  if (pathname.startsWith('/inventory')) {
    return {
      text: 'Loading Warehouse Inventory...',
      subtext: 'Auditing stock balances, low-stock alerts & movements'
    };
  }
  if (pathname.startsWith('/dashboard')) {
    return {
      text: 'Loading Operations Center...',
      subtext: 'Aggregating site telemetry, KPIs and metrics'
    };
  }
  return {
    text: 'Loading Workspace...',
    subtext: 'Preparing dashboard view'
  };
}

export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [isQuickPOOpen, setIsQuickPOOpen] = useState(false);
  const [isSwitchingPage, setIsSwitchingPage] = useState(false);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setIsSwitchingPage(true);
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Clean, snappy page transition loader
      const timer = setTimeout(() => {
        setIsSwitchingPage(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };
  const closeSidebar = () => setSidebarOpen(false);
  const activeRouteMeta = getRouteMetadata(location.pathname);

  return (
    <div className="app-wrapper">
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={closeSidebar}
      />

      <div className={`app-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenQuickReport={() => setIsQuickReportOpen(true)}
          onOpenQuickPO={() => setIsQuickPOOpen(true)}
        />

        <main className="page-content">
          <div className="content-container">
            {isSwitchingPage ? (
              <PageLoader
                text={activeRouteMeta.text}
                subtext={activeRouteMeta.subtext}
              />
            ) : (
              <Outlet
                context={{
                  openCreateProjectModal: () => setIsCreateProjectOpen(true),
                  openQuickReportModal: () => setIsQuickReportOpen(true),
                  openQuickPOModal: () => setIsQuickPOOpen(true)
                }}
              />
            )}
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
