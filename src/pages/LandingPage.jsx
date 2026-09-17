import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  HardHat,
  Layers,
  BarChart3,
  Boxes,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Play,
  Search,
  ChevronDown,
  X,
  MapPin,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Users,
  Check,
  Calendar,
  DollarSign,
  ClipboardCheck,
  FileCheck2,
  Award,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Server,
  Zap,
  PhoneCall,
  Menu
} from 'lucide-react';
import '../styles/landing.css';
import StaggerTestimonials from '../components/common/StaggerTestimonials';
import BuildoraLogo from '../components/common/BuildoraLogo';
import ImageStack from '../components/common/ImageStack';
import LivePlatformShowcase from '../components/common/LivePlatformShowcase';
import FeaturesScrollStack from '../components/common/FeaturesScrollStack';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState('overview');

  // Handle scroll for sticky navbar blur effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "What is Buildora?",
      a: "Buildora is an end-to-end enterprise construction management platform designed for contractors, developers, and project teams to plan schedules, track daily site operations, manage procurement & inventory, and control budgets in real-time."
    },
    {
      q: "How does Buildora handle offline site reporting?",
      a: "Buildora features offline-first mobile sync. Site supervisors and field engineers can record daily logs, capture geo-tagged photos, and log material deliveries without internet connection. Data syncs automatically once reconnected."
    },
    {
      q: "Can Buildora integrate with our existing ERPs & CAD/BIM software?",
      a: "Yes! Buildora seamlessly integrates with major ERP systems (SAP, Oracle, Tally), BIM software (Autodesk Revit, Navisworks), and cloud storage platforms via secure REST APIs and webhooks."
    },
    {
      q: "How quickly can our project teams get onboarded?",
      a: "Our intuitive interface is engineered specifically for construction professionals with zero steep learning curve. Most teams are fully up and running on active jobsites within 48 to 72 hours with our guided onboarding."
    },
    {
      q: "What security and compliance certifications are supported?",
      a: "Buildora complies with ISO 27001, SOC 2 Type II, and strict role-based access control (RBAC) with full audit logs and enterprise data encryption in transit (TLS 1.3) and at rest (AES-256)."
    }
  ];

  return (
    <div className="buildora-landing">
      {/* ====================================================================
          1. NAVBAR
          ==================================================================== */}
      <header className={`lp-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="lp-brand-logo">
            <div className="lp-logo-icon">
              <BuildoraLogo size={26} color="var(--lp-matte-accent)" />
            </div>
            <span className="lp-brand-text">BUILDORA</span>
          </Link>

          <nav>
            <ul className="lp-nav-links">
              <li>
                <a href="#hero" className="lp-nav-link active" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="lp-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
                  Features
                </a>
              </li>
              <li>
                <a href="#solutions" className="lp-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('solutions'); }}>
                  Solutions
                </a>
              </li>
              <li>
                <a href="#demo" className="lp-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('demo'); }}>
                  Platform
                </a>
              </li>
              <li>
                <a href="#faq" className="lp-nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>
                  FAQ
                </a>
              </li>
            </ul>
          </nav>

          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-login">
              Login
            </Link>
            <Link to="/register" className="lp-btn-primary-nav">
              Get Started Free <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              className="lp-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Menu */}
        <div className={`lp-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="lp-mobile-nav-list">
            <li>
              <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
                Home
              </a>
            </li>
            <li>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
                Features
              </a>
            </li>
            <li>
              <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToSection('solutions'); }}>
                Solutions
              </a>
            </li>
            <li>
              <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo'); }}>
                Platform Showcase
              </a>
            </li>
            <li>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>
                FAQ
              </a>
            </li>
          </ul>

          <div className="lp-mobile-drawer-actions">
            <Link to="/login" className="lp-mobile-btn-login" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="lp-mobile-btn-register" onClick={() => setMobileMenuOpen(false)}>
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. HERO SECTION - CINEMATIC ARCHITECTURAL BLUEPRINT VIDEO
          ==================================================================== */}
      <section id="hero" className="lp-hero-editorial lp-blueprint-bg">
        {/* Full Hero Responsive Background Video */}
        <div className="lp-hero-bg-video-wrapper">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="lp-hero-bg-video"
          >
            <source src="/videos/hero-blueprint.mp4" type="video/mp4" />
          </video>
          <div className="lp-hero-video-overlay"></div>
          <div className="lp-hero-video-grid-overlay"></div>
        </div>

        <div className="lp-hero-editorial-ambient"></div>

        <div className="lp-hero-editorial-container">
          {/* Editorial Top Content */}
          <div className="lp-editorial-header">
            <h1 className="lp-editorial-headline">
              Build smarter,<br />manage better.
            </h1>

            <p className="lp-editorial-description">
              A simple workspace for construction teams to plan projects, track progress, control budgets, and stay connected.
            </p>

            <div className="lp-editorial-actions">
              <Link to="/register" className="lp-editorial-btn-primary">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="lp-editorial-btn-secondary"
                onClick={() => setShowContactModal(true)}
              >
                <Calendar size={16} />
                Book a Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. LOGO BANNER & TRUSTED PARTNERS MARQUEE
          ==================================================================== */}
      <section className="lp-stats-banner">
        <div className="lp-marquee-container">
          <div className="lp-logos-eyebrow">TRUSTED BY LEADING BUILDERS & INFRASTRUCTURE DEVELOPERS</div>
          <div className="lp-marquee-wrapper">
            <div className="lp-marquee-track">
              {/* Partner Logo Items - Set 1 */}
              <div className="lp-client-logo-item">
                <Building2 size={22} className="lp-marquee-icon" />
                <span>Larsen & Toubro</span>
              </div>
              <div className="lp-client-logo-item">
                <Layers size={22} className="lp-marquee-icon" />
                <span>Tata Projects</span>
              </div>
              <div className="lp-client-logo-item">
                <Boxes size={22} className="lp-marquee-icon" />
                <span>Shapoorji Pallonji</span>
              </div>
              <div className="lp-client-logo-item">
                <Sparkles size={22} className="lp-marquee-icon" />
                <span>Godrej Properties</span>
              </div>
              <div className="lp-client-logo-item">
                <HardHat size={22} className="lp-marquee-icon" />
                <span>Lodha Group</span>
              </div>
              <div className="lp-client-logo-item">
                <TrendingUp size={22} className="lp-marquee-icon" />
                <span>DLF Limited</span>
              </div>
              <div className="lp-client-logo-item">
                <Award size={22} className="lp-marquee-icon" />
                <span>Sobha Developers</span>
              </div>
              <div className="lp-client-logo-item">
                <ShieldCheck size={22} className="lp-marquee-icon" />
                <span>Prestige Group</span>
              </div>
              <div className="lp-client-logo-item">
                <ClipboardCheck size={22} className="lp-marquee-icon" />
                <span>Brigade Enterprises</span>
              </div>
              <div className="lp-client-logo-item">
                <Server size={22} className="lp-marquee-icon" />
                <span>Oberoi Realty</span>
              </div>

              {/* Partner Logo Items - Set 2 (Duplicate for infinite seamless scroll) */}
              <div className="lp-client-logo-item" aria-hidden="true">
                <Building2 size={22} className="lp-marquee-icon" />
                <span>Larsen & Toubro</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <Layers size={22} className="lp-marquee-icon" />
                <span>Tata Projects</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <Boxes size={22} className="lp-marquee-icon" />
                <span>Shapoorji Pallonji</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <Sparkles size={22} className="lp-marquee-icon" />
                <span>Godrej Properties</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <HardHat size={22} className="lp-marquee-icon" />
                <span>Lodha Group</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <TrendingUp size={22} className="lp-marquee-icon" />
                <span>DLF Limited</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <Award size={22} className="lp-marquee-icon" />
                <span>Sobha Developers</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <ShieldCheck size={22} className="lp-marquee-icon" />
                <span>Prestige Group</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <ClipboardCheck size={22} className="lp-marquee-icon" />
                <span>Brigade Enterprises</span>
              </div>
              <div className="lp-client-logo-item" aria-hidden="true">
                <Server size={22} className="lp-marquee-icon" />
                <span>Oberoi Realty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. CORE SOLUTIONS SECTION (5 CARDS WITH CONNECTOR LINE)
          ==================================================================== */}
      <section id="solutions" className="lp-solutions-section">
        <div className="lp-solutions-container">
          <div className="lp-solutions-header">
            <span className="lp-solutions-eyebrow">OUR SOLUTIONS</span>
            <h2 className="lp-solutions-title">
              Everything You Need for<br />
              Construction Success
            </h2>
            <p className="lp-solutions-subtext">
              From project planning to field solutions, Buildora brings all of construction progress on one powerful platform.
            </p>
          </div>

          <div className="lp-solutions-grid-wrapper">
            <div className="lp-solutions-connector-line" aria-hidden="true" />
            <div className="lp-solutions-grid-5">
              {[
                {
                  id: 'pm',
                  icon: Layers,
                  title: 'Project Management',
                  description: 'Plan, schedule, and execute complex construction projects on time with real-time budget tracking and CPM Gantt timelines.'
                },
                {
                  id: 'site-ops',
                  icon: HardHat,
                  title: 'Site Operations',
                  description: 'Maintain complete site visibility, daily progress reports, worker attendance logs, and instant snag resolution.'
                },
                {
                  id: 'procurement',
                  icon: Truck,
                  title: 'Procurement & Supply',
                  description: 'Manage purchase orders, material requisition requests, vendor tenders, and deliveries seamlessly.'
                },
                {
                  id: 'inventory',
                  icon: Boxes,
                  title: 'Inventory',
                  description: 'Track warehouse stock, rebar & cement batch consumption, transfers, and eliminate jobsite wastage.'
                },
                {
                  id: 'analytics',
                  icon: BarChart3,
                  title: 'Analytics & Insights',
                  description: 'Make data-driven decisions with automated executive dashboards, cost-to-complete, and predictive risk alerts.'
                }
              ].map((sol) => {
                const IconComp = sol.icon;
                return (
                  <div key={sol.id} className="lp-solution-card">
                    <div className="lp-sol-icon-box">
                      <IconComp size={20} strokeWidth={1.9} />
                    </div>
                    <h3 className="lp-sol-title">{sol.title}</h3>
                    <p className="lp-sol-desc">{sol.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. PROBLEM VS SOLUTION SECTION
          ==================================================================== */}
      <section className="lp-problem-section">
        <div className="lp-problem-container">
          {/* Left: Interactive 3D Construction Image Stack Deck */}
          <div className="lp-problem-visual-stack">
            <ImageStack />
          </div>

          {/* Right: Section Header and Comparison Cards */}
          <div className="lp-problem-content">
            <div className="lp-problem-eyebrow">
              THE PROBLEM & THE BUILDORA CURE
            </div>

            <h2 className="lp-problem-title">
              Construction management shouldn't be this complicated.
            </h2>

            <p className="lp-problem-subtext">
              Traditional construction projects fail due to fragmented communications, siloed spreadsheets, and delayed jobsite reporting that devour profit margins.
            </p>

            <div className="lp-comparison-wrapper">
              {/* Card 1: Legacy */}
              <div className="lp-comp-card legacy">
                <div className="lp-comp-header problem">
                  <div className="lp-comp-icon-badge legacy">
                    <AlertTriangle size={13} strokeWidth={2.4} />
                  </div>
                  <span>THE LEGACY STRUGGLE</span>
                </div>
                <ul className="lp-comp-list">
                  <li className="lp-comp-item problem">
                    <X size={14} strokeWidth={2.4} />
                    <span>Scattered project data spread across spreadsheets & chats</span>
                  </li>
                  <li className="lp-comp-item problem">
                    <X size={14} strokeWidth={2.4} />
                    <span>Delayed communication causing costly rework & schedule slips</span>
                  </li>
                  <li className="lp-comp-item problem">
                    <X size={14} strokeWidth={2.4} />
                    <span>Inaccurate paper site logs with zero real-time auditability</span>
                  </li>
                  <li className="lp-comp-item problem">
                    <X size={14} strokeWidth={2.4} />
                    <span>Untracked material leakages draining jobsite budgets</span>
                  </li>
                </ul>
              </div>

              {/* Middle Arrow Connector */}
              <div className="lp-comp-arrow-divider" aria-hidden="true">
                <ArrowRight size={18} strokeWidth={2.2} />
              </div>

              {/* Card 2: Buildora */}
              <div className="lp-comp-card buildora">
                <div className="lp-comp-header solution">
                  <div className="lp-comp-icon-badge solution">
                    <Check size={13} strokeWidth={2.8} />
                  </div>
                  <span>THE BUILDORA SOLUTION</span>
                </div>
                <ul className="lp-comp-list">
                  <li className="lp-comp-item solution">
                    <Check size={14} strokeWidth={2.4} />
                    <span><strong>Centralized Visibility:</strong> Single source of truth for all projects</span>
                  </li>
                  <li className="lp-comp-item solution">
                    <Check size={14} strokeWidth={2.4} />
                    <span><strong>Real-time Collaboration:</strong> Instant sync between field engineers & PMs</span>
                  </li>
                  <li className="lp-comp-item solution">
                    <Check size={14} strokeWidth={2.4} />
                    <span><strong>Automated Reporting:</strong> One-click daily logs, snags & photo audits</span>
                  </li>
                  <li className="lp-comp-item solution">
                    <Check size={14} strokeWidth={2.4} />
                    <span><strong>Cost & Stock Control:</strong> Live material alerts & 3-way matching</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. STAGE EXPLORER (FRAMER-MOTION SCROLL-DRIVEN STACKING DECK)
          ==================================================================== */}
      <FeaturesScrollStack />

      {/* ====================================================================
          6. PROCESS FLOW (4 STEPS)
          ==================================================================== */}
      <section className="lp-process-section">
        <div className="lp-process-container">
          <div className="lp-section-header">
            <span className="lp-section-eyebrow">OUR PROCESS</span>
            <h2 className="lp-section-title">Simple Steps to Better Project Management</h2>
            <p className="lp-section-subtext">
              Get started in minutes and see the difference in your daily execution and bottom-line profit.
            </p>
          </div>

          <div className="lp-steps-grid">
            {/* Step 1 */}
            <div className="lp-step-item">
              <div className="lp-step-badge">01</div>
              <h3 className="lp-step-title">Plan</h3>
              <p className="lp-step-desc">
                Define project scope, upload architectural drawings, set WBS milestones, and allocate budgets.
              </p>
              <div className="lp-step-arrow">→</div>
            </div>

            {/* Step 2 */}
            <div className="lp-step-item">
              <div className="lp-step-badge">02</div>
              <h3 className="lp-step-title">Manage</h3>
              <p className="lp-step-desc">
                Coordinate teams, assign work packages to subcontractors, and manage digital material requisitions.
              </p>
              <div className="lp-step-arrow">→</div>
            </div>

            {/* Step 3 */}
            <div className="lp-step-item">
              <div className="lp-step-badge">03</div>
              <h3 className="lp-step-title">Monitor</h3>
              <p className="lp-step-desc">
                Capture site progress with geo-tagged photos, track daily manpower, and resolve snag tickets instantly.
              </p>
              <div className="lp-step-arrow">→</div>
            </div>

            {/* Step 4 */}
            <div className="lp-step-item">
              <div className="lp-step-badge">04</div>
              <h3 className="lp-step-title">Deliver</h3>
              <p className="lp-step-desc">
                Handover on schedule, generate compliance dossiers, and close out financial audits with 100% precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. PRODUCT DEMO SHOWCASE (INTERACTIVE SAAS PLATFORM SHOWCASE)
          ==================================================================== */}
      <LivePlatformShowcase onBookDemo={() => setShowContactModal(true)} />

      {/* ====================================================================
          VALUE PROPS SECTION ("More Than Just Project Management")
          ==================================================================== */}
      <section className="lp-value-props-section">
        <div className="lp-value-props-grid">
          <div className="lp-value-item">
            <div className="lp-value-icon">
              <Layers size={22} />
            </div>
            <div>
              <div className="lp-value-title">Capacity Visibility</div>
              <div className="lp-value-sub">Optimize crew loads</div>
            </div>
          </div>

          <div className="lp-value-item">
            <div className="lp-value-icon">
              <Users size={22} />
            </div>
            <div>
              <div className="lp-value-title">Active Collaboration</div>
              <div className="lp-value-sub">Connect all stakeholders</div>
            </div>
          </div>

          <div className="lp-value-item">
            <div className="lp-value-icon">
              <DollarSign size={22} />
            </div>
            <div>
              <div className="lp-value-title">Cost Control</div>
              <div className="lp-value-sub">Prevent budget overruns</div>
            </div>
          </div>

          <div className="lp-value-item">
            <div className="lp-value-icon">
              <Calendar size={22} />
            </div>
            <div>
              <div className="lp-value-title">Schedule Intelligence</div>
              <div className="lp-value-sub">AI risk mitigation</div>
            </div>
          </div>

          <div className="lp-value-item">
            <div className="lp-value-icon">
              <Award size={22} />
            </div>
            <div>
              <div className="lp-value-title">Snag-Free Delivery</div>
              <div className="lp-value-sub">100% QA/QC sign-off</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          IMPACT STATS & TESTIMONIALS (REAL PROJECTS, LASTING IMPACT)
          ==================================================================== */}
      <section className="lp-impact-section">
        <div className="lp-impact-container">
          <div className="lp-impact-metrics">
            <div>
              <div className="lp-impact-stat">580+</div>
              <div className="lp-impact-label">Completed Projects</div>
            </div>
            <div>
              <div className="lp-impact-stat">56+</div>
              <div className="lp-impact-label">Active Enterprise Sites</div>
            </div>
            <div>
              <div className="lp-impact-stat">1,300+</div>
              <div className="lp-impact-label">Field Engineers & PMs</div>
            </div>
            <div>
              <div className="lp-impact-stat">99.9%</div>
              <div className="lp-impact-label">Enterprise Platform Uptime</div>
            </div>
          </div>

          <div className="lp-testimonials-intro">
            <span className="lp-section-eyebrow" style={{ color: 'var(--lp-matte-accent)', marginBottom: '8px' }}>
              CUSTOMER STORIES
            </span>
            <h2 className="lp-section-title" style={{ color: '#FFFFFF', textAlign: 'center', marginBottom: '12px' }}>
              Trusted by Top Contractors & Builders
            </h2>
            <p className="lp-section-subtext" style={{ color: '#94A3B8', textAlign: 'center', maxWidth: '640px', margin: '0 auto 20px' }}>
              See how modern construction leaders accelerate project handovers and eliminate jobsite delays with Buildora.
            </p>
          </div>

          <StaggerTestimonials />
        </div>
      </section>

      {/* ====================================================================
          FAQ ACCORDION SECTION
          ==================================================================== */}
      <section id="faq" className="lp-faq-section">
        <div className="lp-faq-container">
          <div className="lp-section-header" style={{ marginBottom: '30px' }}>
            <span className="lp-section-eyebrow">GOT QUESTIONS?</span>
            <h2 className="lp-section-title">Frequently Asked Questions</h2>
            <p className="lp-section-subtext">
              Everything you need to know about implementing Buildora across your jobsites.
            </p>
          </div>

          <div className="lp-faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`lp-faq-item ${activeFaq === index ? 'active' : ''}`}
              >
                <button
                  className="lp-faq-question"
                  onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="lp-faq-toggle-icon" />
                </button>
                {activeFaq === index && (
                  <div className="lp-faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. FINAL CTA BANNER & FOOTER
          ==================================================================== */}
      <section className="lp-final-cta-section">
        <img
          src="/images/construction_night_skyline.jpg"
          alt="Night skyline of architectural towers and cranes"
          className="lp-final-cta-bg"
        />
        <div className="lp-final-cta-overlay"></div>

        <div className="lp-final-cta-content">
          <span className="lp-section-eyebrow" style={{ color: '#E0A96D' }}>GET STARTED TODAY</span>
          <h2 className="lp-final-cta-title">Ready to build your next project?</h2>
          <p className="lp-final-cta-sub">
            Join 50+ leading contractors and developers building faster, smarter, and with zero guesswork.
          </p>

          <div className="lp-final-cta-actions">
            <Link to="/register" className="lp-hero-btn-primary">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button
              className="lp-hero-btn-secondary"
              onClick={() => setShowContactModal(true)}
            >
              <PhoneCall size={16} />
              Book a 1-on-1 Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="lp-footer-grid">
            {/* Brand column */}
            <div className="lp-footer-brand-col">
              <Link to="/" className="lp-brand-logo">
                <div className="lp-logo-icon">
                  <BuildoraLogo size={22} color="var(--lp-matte-accent)" />
                </div>
                <span className="lp-brand-text">BUILDORA</span>
              </Link>
              <p className="lp-footer-tagline">
                The next-generation enterprise construction management platform. Built to empower project managers, field engineers, and developers.
              </p>
              <div className="lp-social-links">
                <a href="#linkedin" className="lp-social-btn" title="LinkedIn">in</a>
                <a href="#twitter" className="lp-social-btn" title="Twitter">𝕏</a>
                <a href="#facebook" className="lp-social-btn" title="Facebook">f</a>
                <a href="#youtube" className="lp-social-btn" title="YouTube">▶</a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <h4 className="lp-footer-col-title">Product</h4>
              <ul className="lp-footer-links">
                <li><a href="#features" onClick={() => scrollToSection('features')} className="lp-footer-link">Project Planning</a></li>
                <li><a href="#features" onClick={() => scrollToSection('features')} className="lp-footer-link">Site Operations</a></li>
                <li><a href="#features" onClick={() => scrollToSection('features')} className="lp-footer-link">Procurement & POs</a></li>
                <li><a href="#features" onClick={() => scrollToSection('features')} className="lp-footer-link">Material Inventory</a></li>
                <li><a href="#demo" onClick={() => scrollToSection('demo')} className="lp-footer-link">Financial Analytics</a></li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div>
              <h4 className="lp-footer-col-title">Solutions</h4>
              <ul className="lp-footer-links">
                <li><a href="#solutions" className="lp-footer-link">General Contractors</a></li>
                <li><a href="#solutions" className="lp-footer-link">Commercial Developers</a></li>
                <li><a href="#solutions" className="lp-footer-link">Infrastructure Projects</a></li>
                <li><a href="#solutions" className="lp-footer-link">Specialty Subcontractors</a></li>
                <li><a href="#solutions" className="lp-footer-link">Quantity Surveyors</a></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h4 className="lp-footer-col-title">Company</h4>
              <ul className="lp-footer-links">
                <li><a href="#about" className="lp-footer-link">About Us</a></li>
                <li><a href="#careers" className="lp-footer-link">Careers</a></li>
                <li><a href="#partners" className="lp-footer-link">Partner Program</a></li>
                <li><a href="#security" className="lp-footer-link">Security & Trust</a></li>
                <li><a href="#contact" onClick={() => setShowContactModal(true)} className="lp-footer-link">Contact Sales</a></li>
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div>
              <h4 className="lp-footer-col-title">Compliance</h4>
              <ul className="lp-footer-links">
                <li><a href="#privacy" className="lp-footer-link">Privacy Policy</a></li>
                <li><a href="#terms" className="lp-footer-link">Terms of Service</a></li>
                <li><a href="#iso" className="lp-footer-link">ISO 27001 Certified</a></li>
                <li><a href="#soc2" className="lp-footer-link">SOC 2 Type II</a></li>
                <li><a href="#cookies" className="lp-footer-link">Cookie Preferences</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div>
              © 2026 BUILDORA Inc. All rights reserved. Built for construction professionals worldwide.
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ color: '#E0A96D' }}>● 99.9% Uptime SLA</span>
              <span>Enterprise Grade Security</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          MODAL: WATCH DEMO VIDEO TOUR
          ==================================================================== */}
      {showDemoModal && (
        <div className="lp-modal-backdrop" onClick={() => setShowDemoModal(false)}>
          <div className="lp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="lp-modal-close-btn" onClick={() => setShowDemoModal(false)}>
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div className="lp-logo-icon" style={{ width: '28px', height: '28px' }}>
                <Play size={14} fill="currentColor" />
              </div>
              <h3 style={{ margin: 0, fontFamily: 'var(--lp-font-heading)', color: '#FFFFFF' }}>
                Buildora Platform Walkthrough
              </h3>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '20px' }}>
              See how Buildora centralizes project scheduling, field logs, procurement approvals, and budget tracking in 90 seconds.
            </p>

            <div style={{
              background: '#070E17',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(224, 169, 109, 0.25)',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--lp-gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0D1B2A' }}>
                <Building2 size={30} />
              </div>
              <h4 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Interactive Construction Simulator Ready</h4>
              <p style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                Try our live sandbox environment with pre-populated multi-tower construction projects, Gantt milestones, and material stock ledgers.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <Link to="/login" className="lp-btn-gold">
                  Launch Interactive Demo Workspace <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: BOOK A 1-ON-1 DEMO / CONTACT
          ==================================================================== */}
      {showContactModal && (
        <div className="lp-modal-backdrop" onClick={() => setShowContactModal(false)}>
          <div className="lp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="lp-modal-close-btn" onClick={() => setShowContactModal(false)}>
              <X size={18} />
            </button>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--lp-font-heading)', color: '#FFFFFF' }}>
              Schedule a Custom Buildora Demo
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Speak with a construction solutions engineer to see how Buildora fits your project portfolio.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Our construction specialist will contact you within 2 business hours.'); setShowContactModal(false); }}>
              <div className="lp-modal-form-grid">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '6px' }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '6px' }}>Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div className="lp-modal-form-grid">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '6px' }}>Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Infrastructure"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '6px' }}>Active Project Count</label>
                  <select
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1B263B', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option>1 - 3 Projects</option>
                    <option>4 - 10 Projects</option>
                    <option>10+ Enterprise Sites</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="lp-btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '12px' }}>
                Confirm Demo Request <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: QUICK FEATURE SEARCH / SPOTLIGHT
          ==================================================================== */}
      {showSearchModal && (
        <div className="lp-modal-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="lp-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <button className="lp-modal-close-btn" onClick={() => setShowSearchModal(false)}>
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Search size={20} color="#E0A96D" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#FFFFFF' }}>Search Buildora Platform</h3>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Search features (e.g., Gantt, daily logs, procurement, inventory)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--lp-gold)',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {[
                { title: 'Project Management & CPM Gantt', section: 'features', desc: 'Critical path milestone tracking & scheduling' },
                { title: 'Site Operations & Daily Logs', section: 'features', desc: 'GPS-verified labor attendance & site reporting' },
                { title: 'Procurement & Purchase Orders', section: 'solutions', desc: 'Requisition workflows and 3-way vendor matching' },
                { title: 'Inventory & Batch Ledger', section: 'solutions', desc: 'Stock alerts and jobsite transfer slips' },
                { title: 'Financial Analytics & S-Curves', section: 'demo', desc: 'Earned value analysis & cash flow forecast' }
              ]
                .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setShowSearchModal(false); scrollToSection(item.section); }}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#E0A96D', fontSize: '0.9rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{item.desc}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
