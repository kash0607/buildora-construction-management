import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Camera,
  Activity,
  ArrowRight
} from 'lucide-react';
import '../../styles/imageStack.css';

const DEFAULT_STACK_ITEMS = [
  {
    id: 'crane-reality',
    title: 'Jobsite Reality & Live Sync',
    description: 'Synchronized field-to-office daily logs eliminate 90% of costly schedule delays.',
    tag: 'Live Site Camera #01',
    metric: '90% Delay Reduction',
    location: 'Tower A • Metro Central',
    image: '/images/construction_site_crane.jpg',
    icon: MapPin,
    accentColor: '#2563EB'
  },
  {
    id: 'night-pour',
    title: '24/7 Site QA & Pour Logs',
    description: 'Real-time slump tests, concrete cube curing telemetry, and digital delivery gate passes.',
    tag: 'Night Pour Telemetry',
    metric: '100% Quality Audited',
    location: 'Podium B • Skyline Heights',
    image: '/images/construction_night_skyline.jpg',
    icon: Activity,
    accentColor: '#E0A96D'
  },
  {
    id: 'blueprint-bim',
    title: '4D BIM & CPM Synchronization',
    description: 'Zero design clashes on site with cloud architectural drawings and automated revision linking.',
    tag: 'BIM 4D Digital Twin',
    metric: '0 Clashes Detected',
    location: 'Design Studio • Main Core',
    image: '/images/hero_blueprint_arch.jpg',
    icon: Layers,
    accentColor: '#38BDF8'
  },
  {
    id: 'field-ops',
    title: 'Offline Field Inspections',
    description: 'Engineers submit geo-tagged daily progress and snag checklists with instant auto-sync.',
    tag: 'GPS Verified Logs',
    metric: '4.8h Saved / Day',
    location: 'Section 4 • North Highway',
    image: '/images/feature_site_ops.jpg',
    icon: ShieldCheck,
    accentColor: '#10B981'
  }
];

export default function ImageStack({ items = DEFAULT_STACK_ITEMS, autoPlay = true, interval = 5000 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);
  const total = items.length;

  // Auto rotate when not hovered
  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isHovered, total]);

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleCardClick = (index) => {
    if (index === activeIndex) {
      // If clicking the active card, advance to next
      handleNext();
    } else {
      setActiveIndex(index);
    }
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="lp-image-stack-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Interactive Construction Image Showcase"
    >
      {/* Ambient Blueprint Backdrop Frame */}
      <div className="lp-image-stack-backdrop" />

      {/* Stacked Cards Deck */}
      <div className="lp-image-stack-deck">
        {items.map((item, idx) => {
          // Calculate relative position from activeIndex: 0 = front, 1 = right, 2 = left, etc.
          const relPos = (idx - activeIndex + total) % total;
          const isActive = relPos === 0;
          const IconComp = item.icon || MapPin;

          return (
            <div
              key={item.id}
              className={`lp-stack-card pos-${relPos} ${isActive ? 'active' : ''}`}
              onClick={() => handleCardClick(idx)}
              style={{
                zIndex: total - relPos
              }}
              title={isActive ? 'Click to view next image' : `Click to view ${item.title}`}
            >
              <div className="lp-stack-card-img-wrapper">
                <img
                  src={item.image}
                  alt={item.title}
                  className="lp-stack-card-img"
                  loading="lazy"
                />
                <div className="lp-stack-card-gradient" />

                {/* Floating Top Tag with Live Pulse */}
                <div className="lp-stack-card-top-tag">
                  <span className="lp-stack-pulse-dot" />
                  <span>{item.tag}</span>
                </div>

                {/* Index Counter */}
                <div className="lp-stack-card-counter">
                  0{idx + 1} / 0{total}
                </div>

                {/* Bottom Card Glass Info Sheet */}
                <div className="lp-stack-card-bottom">
                  <div className="lp-stack-card-main-info">
                    <div
                      className="lp-stack-badge-icon-box"
                      style={{
                        background: item.accentColor
                          ? `linear-gradient(135deg, ${item.accentColor} 0%, #0F1D2E 120%)`
                          : undefined
                      }}
                    >
                      <IconComp size={18} strokeWidth={2.4} />
                    </div>
                    <div className="lp-stack-badge-text-box">
                      <h4 className="lp-stack-card-title">
                        <span>{item.title}</span>
                      </h4>
                      <p className="lp-stack-card-desc">{item.description}</p>
                    </div>
                  </div>

                  {/* Active Card Bottom Metrics */}
                  {isActive && (
                    <div className="lp-stack-metric-row">
                      <div className="lp-stack-metric-pill">
                        <Sparkles size={13} color="#E0A96D" />
                        <span className="lp-stack-metric-highlight">{item.metric}</span>
                      </div>
                      <div className="lp-stack-location-pill">
                        <MapPin size={12} />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack Controls Toolbar */}
      <div className="lp-stack-controls">
        {/* Pagination Pill Dots */}
        <div className="lp-stack-dots">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`lp-stack-dot-btn ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="lp-stack-hint">
          <span>Click card to cycle</span>
        </div>

        {/* Next / Prev Navigation Buttons */}
        <div className="lp-stack-arrows">
          <button
            type="button"
            className="lp-deck-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous image"
          >
            <ChevronLeft size={17} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className="lp-deck-arrow-btn"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight size={17} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
