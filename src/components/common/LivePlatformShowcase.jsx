import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  FileCheck2,
  HardHat,
  TrendingUp,
  ArrowRight,
  Calendar,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Building2,
  Sparkles,
  Layers,
  ChevronRight,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import '../../styles/platformShowcase.css';

const SHOWCASE_FEATURES = [
  {
    id: 'visibility',
    title: 'Real-Time Project Visibility',
    eyebrow: 'EXECUTIVE OVERVIEW',
    subtext: 'Live tracking across all 18 active sites with synchronized progress.',
    icon: BarChart3,
    color: '#2563EB',
    tabLabel: 'Overview',
    kpis: [
      { title: 'Active Projects', val: '18 Sites', badge: '● All Operational', type: 'green' },
      { title: 'Overall Progress', val: '78.4%', badge: '+3.2% this week', type: 'gold' },
      { title: 'Budget Variance', val: '+1.8%', badge: 'Under Budget', type: 'green' }
    ]
  },
  {
    id: 'inventory',
    title: 'Material Alerts & Inventory Logs',
    eyebrow: 'STOCK & REQUISITIONS',
    subtext: 'Granular batch tracking for cement, rebar, steel, and zero site wastage.',
    icon: Boxes,
    color: '#E0A96D',
    tabLabel: 'Inventory',
    kpis: [
      { title: 'Total SKUs Tracked', val: '482 Items', badge: '● 98% In Stock', type: 'green' },
      { title: 'Wastage Rate', val: '1.4%', badge: '-14% vs avg', type: 'green' },
      { title: 'Restock Triggers', val: '2 Alerts', badge: 'Auto PO Drafted', type: 'gold' }
    ]
  },
  {
    id: 'approvals',
    title: 'Approval Management Workflows',
    eyebrow: '3-WAY MATCHING',
    subtext: 'Automated 3-way matching across POs, Challans, and Invoices with zero overbilling.',
    icon: FileCheck2,
    color: '#38BDF8',
    tabLabel: 'Approvals',
    kpis: [
      { title: 'Pending POs', val: '3 Requests', badge: 'Within Threshold', type: 'blue' },
      { title: 'Avg Turnaround', val: '2.4 Hours', badge: '92% Faster', type: 'green' },
      { title: '3-Way Match Rate', val: '100% OK', badge: 'Audit Verified', type: 'green' }
    ]
  },
  {
    id: 'snags',
    title: 'Site Reporting & Snag Ticketing',
    eyebrow: 'FIELD AUDITS & QA',
    subtext: 'Offline-ready daily progress logs, geo-tagged snags, and GPS labor attendance.',
    icon: HardHat,
    color: '#F59E0B',
    tabLabel: 'Site Logs',
    kpis: [
      { title: 'Daily Logs', val: '18 / 18 Synced', badge: '● 100% Complete', type: 'green' },
      { title: 'Open Snag Tickets', val: '4 Items', badge: '2 High Priority', type: 'gold' },
      { title: 'Active Labor Crew', val: '1,320 Workers', badge: 'Biometric Verified', type: 'blue' }
    ]
  },
  {
    id: 'finance',
    title: 'Real-Time Financial Tracking',
    eyebrow: 'EARNED VALUE (EVA)',
    subtext: 'Automated S-curves, CPI/SPI indices, cash-flow models, and variance forecasts.',
    icon: TrendingUp,
    color: '#10B981',
    tabLabel: 'Financials',
    kpis: [
      { title: 'Committed POs', val: '₹42.50 Cr', badge: 'Budget: ₹45.00 Cr', type: 'blue' },
      { title: 'Cost Perf Index', val: 'CPI 1.06', badge: '+6% Cost Effective', type: 'green' },
      { title: 'Sched Perf Index', val: 'SPI 1.02', badge: 'Ahead of Target', type: 'green' }
    ]
  }
];

const CYCLE_DURATION = 5000; // 5 seconds per feature tab

export default function LivePlatformShowcase({ onBookDemo }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeFeature = SHOWCASE_FEATURES[activeIdx];
  const startTimeRef = useRef(Date.now());

  // Auto-cycling animation logic
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now() - (progress / 100) * CYCLE_DURATION;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / CYCLE_DURATION) * 100);
      setProgress(pct);

      if (pct >= 100) {
        setActiveIdx((prev) => (prev + 1) % SHOWCASE_FEATURES.length);
        setProgress(0);
        startTimeRef.current = Date.now();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isPaused, progress, activeIdx]);

  const selectFeature = (idx) => {
    setActiveIdx(idx);
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  return (
    <section id="demo" className="lp-showcase-section">
      <div className="lp-showcase-container">
        <div className="lp-showcase-grid">
          {/* ================================================================
              COLUMN 1: Left Headline & CTA Actions
              ================================================================ */}
          <div className="lp-showcase-left">
            <div className="lp-showcase-badge">
              <span className="lp-showcase-pulse-dot" />
              <span>LIVE ENTERPRISE PLATFORM</span>
            </div>

            <h2 className="lp-showcase-title">
              One place to command your entire operation.
            </h2>

            <p className="lp-showcase-desc">
              Gain complete real-time command over multi-site schedules, labor deployment, batch materials, and contractor cash flows without leaving your desk.
            </p>

            {/* Quick Live Stats Row */}
            <div className="lp-showcase-stats-row">
              <div className="lp-showcase-stat-item">
                <span className="lp-showcase-stat-val">18 Sites</span>
                <span className="lp-showcase-stat-lbl">Active Projects</span>
              </div>
              <div className="lp-showcase-stat-item">
                <span className="lp-showcase-stat-val">100%</span>
                <span className="lp-showcase-stat-lbl">Field-to-Office Sync</span>
              </div>
              <div className="lp-showcase-stat-item">
                <span className="lp-showcase-stat-val">+34%</span>
                <span className="lp-showcase-stat-lbl">Execution Velocity</span>
              </div>
            </div>

            {/* Dual CTA Buttons */}
            <div className="lp-showcase-actions">
              <Link to="/login" className="lp-btn-primary-showcase">
                Explore Live Workspace <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="lp-btn-secondary-showcase"
                onClick={onBookDemo}
              >
                <Calendar size={16} />
                Book a Live Demo
              </button>
            </div>
          </div>

          {/* ================================================================
              COLUMN 2: Large, High-Fidelity & Ultra-Readable Laptop Mockup
              ================================================================ */}
          <div
            className="lp-showcase-mockup-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Laptop Physical Chassis */}
            <div className="lp-laptop-chassis">
              {/* Screen Bezel */}
              <div className="lp-laptop-bezel">
                {/* Camera Bar with subtle indicator */}
                <div className="lp-laptop-camera-bar">
                  <div className="lp-laptop-lens" />
                  <div className="lp-laptop-cam-led" />
                </div>

                {/* Laptop Inner Screen Display */}
                <div className="lp-laptop-screen-display">
                  {/* App Header Topbar */}
                  <div className="lp-dash-topbar">
                    <div className="lp-dash-brand">
                      <Building2 size={17} color="#E0A96D" />
                      <span>BUILDORA CLOUD</span>
                    </div>

                    <div className="lp-dash-tabs">
                      {SHOWCASE_FEATURES.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`lp-dash-tab-btn ${activeIdx === idx ? 'active' : ''}`}
                          onClick={() => selectFeature(idx)}
                        >
                          {item.tabLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inner Dashboard Body */}
                  <div className="lp-dash-body">
                    {/* 3 KPI Cards */}
                    <div className="lp-dash-kpis">
                      {activeFeature.kpis.map((kpi, kIdx) => (
                        <div key={kIdx} className="lp-dash-kpi">
                          <span className="lp-dash-kpi-title">{kpi.title}</span>
                          <span className="lp-dash-kpi-val">{kpi.val}</span>
                          <span className={`lp-dash-kpi-badge ${kpi.type}`}>
                            {kpi.badge}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Dynamic Viewport According to Active Tab */}
                    <div key={activeFeature.id} className="lp-dash-viewport">
                      {/* VIEW 1: Overview / Manpower Bar Chart */}
                      {activeFeature.id === 'visibility' && (
                        <>
                          <div className="lp-dash-view-header">
                            <span className="lp-dash-view-title">
                              <BarChart3 size={15} color="#2563EB" /> Weekly Manpower Deployment vs Daily Concrete Pour
                            </span>
                            <span className="lp-dash-live-tag">
                              <span className="lp-showcase-pulse-dot" style={{ width: 7, height: 7 }} /> 1,320 Workers Active
                            </span>
                          </div>
                          <div className="lp-bar-chart">
                            {[
                              { day: 'Mon', h: '58%', val: '1,180' },
                              { day: 'Tue', h: '72%', val: '1,240' },
                              { day: 'Wed', h: '84%', val: '1,290' },
                              { day: 'Thu', h: '94%', val: '1,320', active: true },
                              { day: 'Fri', h: '89%', val: '1,310' },
                              { day: 'Sat', h: '98%', val: '1,340', active: true },
                              { day: 'Sun', h: '75%', val: '1,210' }
                            ].map((b, bIdx) => (
                              <div key={bIdx} className="lp-bar-group">
                                <span className="lp-bar-val-tip">{b.val}</span>
                                <div
                                  className={`lp-bar-stick ${b.active ? 'active' : ''}`}
                                  style={{ height: b.h }}
                                />
                                <span className="lp-bar-label">{b.day}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* VIEW 2: Material & Inventory Ledger */}
                      {activeFeature.id === 'inventory' && (
                        <>
                          <div className="lp-dash-view-header">
                            <span className="lp-dash-view-title">
                              <Boxes size={15} color="#E0A96D" /> Live Batch Material Ledger & Threshold Monitoring
                            </span>
                            <span className="lp-dash-live-tag" style={{ color: '#E0A96D' }}>
                              Auto Reorder Active
                            </span>
                          </div>
                          <div className="lp-stock-list">
                            <div className="lp-stock-item">
                              <div className="lp-stock-info">
                                <span className="lp-stock-name">Fe 550D High-Yield Rebar (32mm)</span>
                                <span className="lp-stock-quant">142 MT <strong style={{ color: '#38BDF8' }}>(82% Safe)</strong></span>
                              </div>
                              <div className="lp-stock-track">
                                <div className="lp-stock-fill" style={{ width: '82%', background: '#38BDF8' }} />
                              </div>
                            </div>
                            <div className="lp-stock-item">
                              <div className="lp-stock-info">
                                <span className="lp-stock-name">Grade 53 OPC Cement Silos</span>
                                <span className="lp-stock-quant">380 Bags <strong style={{ color: '#F59E0B' }}>(Restock Triggered)</strong></span>
                              </div>
                              <div className="lp-stock-track">
                                <div className="lp-stock-fill" style={{ width: '34%', background: '#F59E0B' }} />
                              </div>
                            </div>
                            <div className="lp-stock-item">
                              <div className="lp-stock-info">
                                <span className="lp-stock-name">MEP Heavy Conduit & PVC Fittings</span>
                                <span className="lp-stock-quant">2,400 Mtrs <strong style={{ color: '#10B981' }}>(91% In Stock)</strong></span>
                              </div>
                              <div className="lp-stock-track">
                                <div className="lp-stock-fill" style={{ width: '91%', background: '#10B981' }} />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* VIEW 3: 3-Way Match Verification Flow */}
                      {activeFeature.id === 'approvals' && (
                        <>
                          <div className="lp-dash-view-header">
                            <span className="lp-dash-view-title">
                              <FileCheck2 size={15} color="#38BDF8" /> Automated 3-Way Match Verification Protocol
                            </span>
                            <span className="lp-dash-live-tag">
                              <CheckCircle2 size={14} color="#4ADE80" /> 100% Zero Discrepancy
                            </span>
                          </div>
                          <div className="lp-match-flow">
                            <div className="lp-match-step">
                              <span className="lp-match-step-title">1. Approved Purchase Order</span>
                              <span className="lp-match-step-val">PO #4928</span>
                              <span className="lp-match-step-status">₹14.80 Lakh Allocated</span>
                            </div>
                            <span className="lp-match-arrow">→</span>
                            <div className="lp-match-step">
                              <span className="lp-match-step-title">2. Verified Site Challan</span>
                              <span className="lp-match-step-val">DC #8192</span>
                              <span className="lp-match-step-status">Gate Weight Checked</span>
                            </div>
                            <span className="lp-match-arrow">→</span>
                            <div className="lp-match-step">
                              <span className="lp-match-step-title">3. Contractor Invoice</span>
                              <span className="lp-match-step-val">INV #9041</span>
                              <span className="lp-match-step-status">Taxes & Retention OK</span>
                            </div>
                          </div>
                          <div className="lp-match-badge-result">
                            <span>Status: Automated reconciliation complete • Ready for contractor payout</span>
                            <strong style={{ color: '#4ADE80' }}>● Auto-Authorized</strong>
                          </div>
                        </>
                      )}

                      {/* VIEW 4: Daily Logs & Snag Priority Matrix */}
                      {activeFeature.id === 'snags' && (
                        <>
                          <div className="lp-dash-view-header">
                            <span className="lp-dash-view-title">
                              <HardHat size={15} color="#F59E0B" /> Field Inspection & Snag Resolution Stream
                            </span>
                            <span className="lp-dash-live-tag">
                              Offline Mobile Sync Active
                            </span>
                          </div>
                          <div className="lp-snag-list">
                            <div className="lp-snag-item">
                              <div>
                                <strong className="lp-snag-title">#SN-108: Column Shuttering Verticality Deviation</strong>
                                <div className="lp-snag-meta">Tower B • Level 14 Core • Site Eng. Deshmukh • Rectified</div>
                              </div>
                              <span className="lp-snag-pill resolved">RESOLVED</span>
                            </div>
                            <div className="lp-snag-item">
                              <div>
                                <strong className="lp-snag-title">#SN-109: Concrete Slump Test & 28-Day Cube Compression</strong>
                                <div className="lp-snag-meta">Podium Deck 2 • Batch M40 • Third-Party Lab Testing Due</div>
                              </div>
                              <span className="lp-snag-pill high">INSPECTION DUE</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* VIEW 5: Earned Value Analysis (EVA) S-Curve Graph */}
                      {activeFeature.id === 'finance' && (
                        <>
                          <div className="lp-dash-view-header">
                            <span className="lp-dash-view-title">
                              <TrendingUp size={15} color="#10B981" /> S-Curve: Planned Value (PV) vs Earned Value (EV)
                            </span>
                            <span className="lp-dash-live-tag" style={{ color: '#10B981' }}>
                              ● Ahead of Budget (CPI 1.06 • SPI 1.02)
                            </span>
                          </div>
                          <div className="lp-scurve-chart">
                            <svg viewBox="0 0 380 85" width="100%" height="85">
                              <defs>
                                <linearGradient id="scurveGradLg" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              {/* Grid lines */}
                              <line x1="0" y1="70" x2="380" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="0" y1="42" x2="380" y2="42" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1="0" y1="15" x2="380" y2="15" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                              {/* Planned Value Line (Dashed Slate) */}
                              <path
                                d="M 12,68 C 95,64 190,46 368,18"
                                fill="none"
                                stroke="#64748B"
                                strokeWidth="2.2"
                                strokeDasharray="4 4"
                              />
                              {/* Earned Value Area & Line (Solid Emerald Green) */}
                              <path
                                d="M 12,68 C 95,60 190,32 368,10 L 368,70 L 12,70 Z"
                                fill="url(#scurveGradLg)"
                              />
                              <path
                                d="M 12,68 C 95,60 190,32 368,10"
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="3"
                              />
                              {/* Active Point Circle */}
                              <circle cx="368" cy="10" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                            </svg>
                            <div className="lp-scurve-legend">
                              <span>Milestone 01: Excavation</span>
                              <span>Milestone 02: Piling & Raft</span>
                              <span style={{ color: '#10B981', fontWeight: 600 }}>Milestone 03: Superstructure (Active)</span>
                              <span>Final Handover</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Polished Laptop Base & Center Notch */}
              <div className="lp-laptop-hinge-base">
                <div className="lp-laptop-center-notch" />
              </div>
            </div>
          </div>

          {/* ================================================================
              COLUMN 3: 5 Interactive Synced Feature Cards with Progress Bars
              ================================================================ */}
          <div
            className="lp-showcase-feature-list"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {SHOWCASE_FEATURES.map((feat, idx) => {
              const IconComp = feat.icon;
              const isActive = activeIdx === idx;

              return (
                <div
                  key={feat.id}
                  className={`lp-showcase-feature-card ${isActive ? 'active' : ''}`}
                  onClick={() => selectFeature(idx)}
                >
                  <div className="lp-feat-icon-box">
                    <IconComp size={20} strokeWidth={2.2} />
                  </div>

                  <div className="lp-feat-content">
                    <div className="lp-feat-eyebrow-row">
                      <span className="lp-feat-eyebrow">{feat.eyebrow}</span>
                      {isActive && (
                        <span className="lp-showcase-pulse-dot" style={{ width: 6, height: 6 }} />
                      )}
                    </div>
                    <h3 className="lp-feat-title">{feat.title}</h3>
                    <p className="lp-feat-subtext">{feat.subtext}</p>
                  </div>

                  {/* Animated Timer Progress Line for active card */}
                  {isActive && (
                    <div
                      className="lp-feat-progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
