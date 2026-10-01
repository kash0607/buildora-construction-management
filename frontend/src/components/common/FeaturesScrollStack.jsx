import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Layers,
  HardHat,
  Truck,
  Boxes,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import '../../styles/landing.css';

const FEATURES_DATA = [
  {
    id: 'project-mgmt',
    tabName: 'Project Management',
    pillLabel: '01 Planning & CPM',
    badge: '01 / 05 • PLANNING & CPM SCHEDULING',
    icon: Layers,
    title: 'Interactive Gantt Schedules & Critical Path Milestones',
    description: 'Plan, sequence, and execute complex multi-phase construction schedules with live CPM dependency tracking, automated delay warnings, and cross-team resource allocation.',
    highlights: [
      'Dynamic Critical Path Method (CPM) timeline with real-time drag-and-drop',
      'Automated milestone dependency linking & weather delay forecasting',
      'Subcontractor workload balancing and crew capacity allocation'
    ],
    tag: 'Live Gantt Engine',
    image: '/images/feature_project_mgmt.jpg'
  },
  {
    id: 'site-ops',
    tabName: 'Site Operations',
    pillLabel: '02 Field Ops & QA',
    badge: '02 / 05 • FIELD EXECUTION & QUALITY',
    icon: HardHat,
    title: 'Digital Daily Site Logs & Offline Field Inspections',
    description: 'Empower site engineers and field supervisors with instant daily reporting, geo-tagged photo inspections, and GPS-verified labor attendance that syncs automatically without internet.',
    highlights: [
      'Offline-first mobile synchronization for remote jobsites',
      'GPS-tagged daily progress logs & biometric worker attendance',
      'Instant snag ticketing with priority matrix & photo audit trails'
    ],
    tag: 'Offline-Ready Sync',
    image: '/images/feature_site_ops.jpg'
  },
  {
    id: 'procurement',
    tabName: 'Procurement & Supply',
    pillLabel: '03 Procurement',
    badge: '03 / 05 • SUPPLY CHAIN & CONTRACTS',
    icon: Truck,
    title: 'Automated Purchase Orders & 3-Way Invoice Matching',
    description: 'Streamline material requisition workflows, vendor tender comparisons, and multi-tier approval hierarchies while preventing overbilling and site material shortages.',
    highlights: [
      'Automated 3-way matching across POs, Delivery Challans, and Invoices',
      'Multi-level authorization thresholds with budget constraint checks',
      'Real-time vendor quote comparison sheets & batch delivery schedules'
    ],
    tag: 'Zero Overbilling',
    image: '/images/feature_procurement.jpg'
  },
  {
    id: 'inventory',
    tabName: 'Inventory & Warehouse',
    pillLabel: '04 Inventory Ledger',
    badge: '04 / 05 • MATERIAL MANAGEMENT',
    icon: Boxes,
    title: 'Real-Time Batch Inventory Ledger & Site Transfers',
    description: 'Eliminate jobsite shrinkage, double-ordering, and wastage with granular batch tracking, QR-coded material receipts, and verified cross-site transfer gate passes.',
    highlights: [
      'Live stock balance ledger for cement, rebar, structural steel & MEP',
      'Automated minimum inventory alerts & one-click reorder triggers',
      'Digital jobsite material transfer slips with supervisor verification'
    ],
    tag: 'Waste Prevention',
    image: '/images/feature_inventory.jpg'
  },
  {
    id: 'analytics',
    tabName: 'Financial Analytics',
    pillLabel: '05 Financial EVA',
    badge: '05 / 05 • EXECUTIVE INTELLIGENCE',
    icon: BarChart3,
    title: 'Earned Value Analysis (EVA) & Cost-to-Complete Forecasts',
    description: 'Gain unshakeable financial clarity with automated S-curves, cost-to-complete projections, and real-time cash flow dashboards across all active sites.',
    highlights: [
      'Automated Earned Value Analysis (EVA, CPI, SPI) performance metrics',
      'Dynamic budget burn-rate projections and contractor cash flow models',
      'One-click board-ready PDF executive reporting and variance alerts'
    ],
    tag: 'Executive Intelligence',
    image: '/images/feature_analytics.jpg'
  }
];

const StickyFeatureCard = ({
  feature,
  i,
  progress,
  range,
  targetScale,
  isActive,
  onCardClick
}) => {
  const IconComp = feature.icon;
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      id={`feature-card-${feature.id}`}
      className="lp-feature-card-sticky-container"
      style={{
        top: `calc(86px + ${i * 18}px)`,
        zIndex: i + 1
      }}
    >
      <motion.div
        style={{
          scale
        }}
        className={`lp-stack-pill-card ${isActive ? 'is-active' : ''}`}
        onClick={onCardClick}
      >
        {/* Left: Rich Info Column */}
        <div className="lp-stack-info-col">
          <div className="lp-stack-badge-pill">
            <IconComp size={15} className="lp-stack-badge-icon" />
            <span>{feature.badge}</span>
          </div>

          <h3 className="lp-stack-card-title">{feature.title}</h3>
          <p className="lp-stack-card-desc">{feature.description}</p>

          <div className="lp-stack-highlights">
            {feature.highlights.map((highlight, hIdx) => (
              <div key={hIdx} className="lp-stack-highlight-item">
                <CheckCircle2 size={18} className="lp-stack-check-icon" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          <div className="lp-stack-footer-action">
            <Link to="/register" className="lp-stack-cta-btn">
              Explore {feature.tabName} <ArrowRight size={15} />
            </Link>
            <span className="lp-stack-index-tag">0{i + 1} / 05</span>
          </div>
        </div>

        {/* Right: Realistic Visual Side */}
        <div className="lp-stack-image-col">
          <div className="lp-stack-image-frame">
            <img
              src={feature.image}
              alt={`${feature.title} demonstration visual`}
              className="lp-stack-image"
              loading="lazy"
            />
            <div className="lp-stack-image-overlay" />
            <div className="lp-stack-image-tag">
              <IconComp size={15} />
              <span>{feature.tag}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function FeaturesScrollStack() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('project-mgmt');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const scrollToCard = (id) => {
    setActiveTab(id);
    const el = document.getElementById(`feature-card-${id}`);
    if (el) {
      const idx = FEATURES_DATA.findIndex((f) => f.id === id);
      const topOffset = 86 + idx * 18;
      const targetScroll = el.getBoundingClientRect().top + window.pageYOffset - topOffset;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      for (let i = FEATURES_DATA.length - 1; i >= 0; i--) {
        const el = document.getElementById(`feature-card-${FEATURES_DATA[i].id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 86 + i * 18 + 60) {
            setActiveTab(FEATURES_DATA[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="features" className="lp-stages-section lp-blueprint-bg-dense">
      <div className="lp-stages-container">
        <div className="lp-stages-header-row">
          <div>
            <span className="lp-section-eyebrow">OUR FEATURES</span>
            <h2 className="lp-section-title">Powerful Features for Every Stage of Construction</h2>
          </div>
          <p className="lp-section-subtext">
            Buildora coordinates your executive office, quantity surveyors, site engineers, and subcontractors seamlessly in unified, intelligent workflows.
          </p>
        </div>

        {/* Quick Jump Stage Filter Pills */}
        <div className="lp-stage-filter-pills" role="tablist" aria-label="Feature stages navigation">
          {FEATURES_DATA.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`lp-stage-filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => scrollToCard(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.pillLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Framer Motion Scrolling Sticky Stacking Deck */}
        <div ref={containerRef} className="lp-features-scroll-track">
          {FEATURES_DATA.map((feature, i) => {
            const targetScale = Math.max(0.78, 1 - (FEATURES_DATA.length - i - 1) * 0.045);
            return (
              <StickyFeatureCard
                key={feature.id}
                feature={feature}
                i={i}
                progress={scrollYProgress}
                range={[i * 0.2, 1]}
                targetScale={targetScale}
                isActive={activeTab === feature.id}
                onCardClick={() => scrollToCard(feature.id)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
