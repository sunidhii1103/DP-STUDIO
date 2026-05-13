import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { algorithmShowcase } from '../../constants/algorithmShowcase';
import type { AlgorithmShowcaseItem } from '../../constants/algorithmShowcase';

/* ── Algorithm dropdown items with category badges ────────────────────────── */
const algorithmItems: {
  item: AlgorithmShowcaseItem;
  badge: string;
  badgeColor: string;
}[] = algorithmShowcase.map((item) => {
  const badgeMap: Record<string, { badge: string; color: string }> = {
    fibonacci: { badge: '1D DP', color: 'var(--nav-badge-cyan)' },
    knapsack: { badge: '2D DP', color: 'var(--nav-badge-green)' },
    lis: { badge: 'Sequence DP', color: 'var(--nav-badge-teal)' },
    mcm: { badge: 'Partition DP', color: 'var(--nav-badge-amber)' },
    lcs: { badge: '2D DP', color: 'var(--nav-badge-blue)' },
    'edit-distance': { badge: 'String DP', color: 'var(--nav-badge-purple)' },
  };
  const info = badgeMap[item.id] ?? { badge: item.pattern, color: 'var(--nav-badge-blue)' };
  return { item, badge: info.badge, badgeColor: info.color };
});

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAlgoOpen, setIsMobileAlgoOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Scroll detection for navbar glass effect ─────────────────────────── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close dropdown when clicking outside ─────────────────────────────── */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  /* ── Close mobile menu on route change ────────────────────────────────── */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileAlgoOpen(false);
  }, [location.pathname]);

  /* ── Lock body scroll when mobile menu open ───────────────────────────── */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  /* ── Dropdown hover handlers with delay ───────────────────────────────── */
  const handleDropdownEnter = useCallback(() => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsDropdownOpen(true);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
  }, []);

  /* ── Navigation handlers ──────────────────────────────────────────────── */
  const launchAlgorithm = (algo: AlgorithmShowcaseItem) => {
    const params = new URLSearchParams({ algo: algo.id, ...algo.launchParams });
    navigate(`/visualizer?${params.toString()}`);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleCompareMode = () => {
    navigate('/visualizer?algo=fibonacci&n=7&mode=comparison');
    setIsMobileMenuOpen(false);
  };

  const handleAbout = () => {
    if (location.pathname === '/') {
      const aboutSection = document.getElementById('about-dp-studio');
      if (aboutSection) {
        const navbarHeight = 64; // var(--navbar-height)
        const top = aboutSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      navigate('/?scrollTo=about-dp-studio');
    }
    setIsMobileMenuOpen(false);
  };

  const isLandingPage = location.pathname === '/';

  return (
    <>
      <nav
        className={`dp-navbar ${isScrolled ? 'dp-navbar--scrolled' : ''} ${
          !isLandingPage ? 'dp-navbar--inner' : ''
        }`}
        id="dp-navbar"
      >
        <div className="dp-navbar__inner">
          {/* ── Left: Logo ────────────────────────────────────────────── */}
          <div
            className="dp-navbar__logo logo-hover"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            aria-label="Go to homepage"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          >
            <img src="/logo.png" alt="DP Studio" width={30} height={30} />
            <span className="dp-navbar__logo-text">DP Studio</span>
          </div>

          {/* ── Center: Navigation Links (Desktop) ────────────────────── */}
          <div className="dp-navbar__center">
            {/* Algorithms Dropdown */}
            <div
              className="dp-navbar__dropdown"
              ref={dropdownRef}
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                className={`dp-navbar__link dp-navbar__link--dropdown ${
                  isDropdownOpen ? 'dp-navbar__link--active' : ''
                }`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                id="nav-algorithms-btn"
              >
                <span>Algorithms</span>
                <svg
                  className={`dp-navbar__chevron ${isDropdownOpen ? 'dp-navbar__chevron--open' : ''}`}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown Panel */}
              <div className={`dp-navbar__dropdown-panel ${isDropdownOpen ? 'dp-navbar__dropdown-panel--open' : ''}`}>
                <div className="dp-navbar__dropdown-header">
                  <span className="dp-navbar__dropdown-kicker">Explore Algorithms</span>
                </div>
                <div className="dp-navbar__dropdown-grid">
                  {algorithmItems.map(({ item, badge, badgeColor }) => (
                    <button
                      key={item.id}
                      className="dp-navbar__dropdown-item"
                      onClick={() => launchAlgorithm(item)}
                      id={`nav-algo-${item.id}`}
                    >
                      <div className="dp-navbar__dropdown-item-icon" style={{ '--_algo-accent': badgeColor } as React.CSSProperties}>
                        {item.icon}
                      </div>
                      <div className="dp-navbar__dropdown-item-content">
                        <span className="dp-navbar__dropdown-item-name">{item.name}</span>
                        <span className="dp-navbar__dropdown-item-badge" style={{ '--_badge-color': badgeColor } as React.CSSProperties}>
                          {badge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Compare Mode */}
            <button
              className="dp-navbar__link"
              onClick={handleCompareMode}
              id="nav-compare-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><path d="M14 3h7v7" /><path d="M3 14h7v7" />
              </svg>
              <span>Compare</span>
            </button>

            {/* About */}
            <button
              className="dp-navbar__link"
              onClick={handleAbout}
              id="nav-about-btn"
            >
              <span>About</span>
            </button>
          </div>

          {/* ── Right: CTA + Hamburger ────────────────────────────────── */}
          <div className="dp-navbar__right">
            <button
              onClick={() => navigate('/visualizer')}
              className="dp-navbar__cta"
              id="nav-launch-btn"
            >
              <span>Launch App</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* Hamburger Button (Mobile) */}
            <button
              className={`dp-navbar__hamburger ${isMobileMenuOpen ? 'dp-navbar__hamburger--open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              id="nav-hamburger-btn"
            >
              <span className="dp-navbar__hamburger-line" />
              <span className="dp-navbar__hamburger-line" />
              <span className="dp-navbar__hamburger-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ─────────────────────────────────────────── */}
      <div
        className={`dp-mobile-overlay ${isMobileMenuOpen ? 'dp-mobile-overlay--open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={`dp-mobile-menu ${isMobileMenuOpen ? 'dp-mobile-menu--open' : ''}`}
        ref={mobileMenuRef}
        id="dp-mobile-menu"
      >
        <div className="dp-mobile-menu__inner">
          {/* Mobile Algorithms Accordion */}
          <div className="dp-mobile-menu__section">
            <button
              className="dp-mobile-menu__link dp-mobile-menu__link--accordion"
              onClick={() => setIsMobileAlgoOpen(!isMobileAlgoOpen)}
            >
              <span>Algorithms</span>
              <svg
                className={`dp-navbar__chevron ${isMobileAlgoOpen ? 'dp-navbar__chevron--open' : ''}`}
                width="12"
                height="7"
                viewBox="0 0 10 6"
                fill="none"
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className={`dp-mobile-menu__algo-list ${isMobileAlgoOpen ? 'dp-mobile-menu__algo-list--open' : ''}`}>
              {algorithmItems.map(({ item, badge, badgeColor }) => (
                <button
                  key={item.id}
                  className="dp-mobile-menu__algo-item"
                  onClick={() => launchAlgorithm(item)}
                >
                  <span className="dp-mobile-menu__algo-name">{item.name}</span>
                  <span className="dp-mobile-menu__algo-badge" style={{ '--_badge-color': badgeColor } as React.CSSProperties}>
                    {badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button className="dp-mobile-menu__link" onClick={handleCompareMode}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><path d="M14 3h7v7" /><path d="M3 14h7v7" />
            </svg>
            <span>Compare Mode</span>
          </button>

          <button className="dp-mobile-menu__link" onClick={handleAbout}>
            <span>About</span>
          </button>

          <div className="dp-mobile-menu__divider" />

          <button
            className="dp-navbar__cta dp-navbar__cta--mobile"
            onClick={() => { navigate('/visualizer'); setIsMobileMenuOpen(false); }}
          >
            <span>Launch App</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
