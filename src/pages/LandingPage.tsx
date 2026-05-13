import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { algorithmShowcase } from '../constants/algorithmShowcase';
import type { AlgorithmShowcaseItem } from '../constants/algorithmShowcase';
import { Navbar } from '../components/navbar/Navbar';

interface FeatureCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ children, delay = 0, className = "" }) => {
  const [ref, isVisible] = useInView();

  return (
    <div
      ref={ref}
      className={`panel feature-card ${isVisible ? "show" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s`, flex: '1 1 300px', padding: '2rem', textAlign: 'left' }}
    >
      {children}
    </div>
  );
};

const FadeInSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ref, isVisible] = useInView();
  return (
    <div ref={ref} className={`fade-in ${isVisible ? "visible" : ""}`}>
      {children}
    </div>
  );
};

const demoSteps = [
  { table: [0, 1, 1, 2, 3], active: 2 },
  { table: [0, 1, 1, 2, 3], active: 3 },
  { table: [0, 1, 1, 2, 3], active: 4 },
];

const InteractiveDemo = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % demoSteps.length);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="demo-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {demoSteps[stepIndex]!.table.map((val, idx) => (
        <div key={idx} className={`demo-cell ${idx === demoSteps[stepIndex]!.active ? 'active' : ''}`}>
          {val}
        </div>
      ))}
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const loaded = true;

  /* ── Handle cross-page scrollTo query param (e.g. from About button) ──── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scrollTarget = params.get('scrollTo');
    if (scrollTarget) {
      // Small delay to let the page render fully before scrolling
      const timer = setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          const navbarHeight = 64;
          const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // Clean the URL without triggering navigation
        window.history.replaceState({}, '', '/');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const launchAlgorithm = (item: AlgorithmShowcaseItem) => {
    const params = new URLSearchParams({ algo: item.id, ...item.launchParams });
    navigate(`/visualizer?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text-primary)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Hero Background Glow */}
      <div className="hero-bg"></div>

      {/* Premium Navbar */}
      <Navbar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', zIndex: 10 }}>
        
        {/* Hero (+ Demo, Glass Panel) */}
        <section className="section hero-section">
          <div className="container" style={{ textAlign: 'center', opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            <h1 className="hero-title">
              Master Dynamic Programming Visually
            </h1>
            <p className="hero-subtitle">
              Built for learning, debugging, and mastering Dynamic Programming.
            </p>
            <p className="hero-description">
              Stop tracing recursive trees on paper. DP Studio provides interactive, step-by-step visualizations of algorithms with live code synchronization.
            </p>
            
            <div className="hero-panel" style={{ margin: '0 auto 2.5rem auto', display: 'inline-block' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Execution Demo</h3>
              <InteractiveDemo />
            </div>
            
            <div>
              <button 
                onClick={() => navigate('/visualizer')}
                className="cta-btn"
                style={{ color: 'white' }}
              >
                Start Exploring
              </button>
            </div>
          </div>
        </section>

        {/* Features (Concise) */}
        <section className="section">
          <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            <FeatureCard delay={0}>
              <h3 style={{ color: 'var(--color-accent-primary)', margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>Step-driven visualization</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>Watch data structures populate sequentially.</p>
            </FeatureCard>
            <FeatureCard delay={0.15}>
              <h3 style={{ color: 'var(--color-success)', margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>Code + state sync</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>Active editor lines match memory states.</p>
            </FeatureCard>
            <FeatureCard delay={0.3}>
              <h3 style={{ color: 'var(--color-warning)', margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>Side-by-side comparison</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>Evaluate memoization vs tabulation.</p>
            </FeatureCard>
          </div>
        </section>

        {/* Algorithm Showcase */}
        <FadeInSection>
          <section className="section algo-section">
            <div className="container">
              <h2 style={{ fontSize: '2.5rem', textAlign: 'center', margin: '0 0 3rem 0' }}>Algorithm Showcase</h2>
              <div className="algo-grid">
                {algorithmShowcase.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`algo-card algo-card--${item.accent}`}
                    onClick={() => launchAlgorithm(item)}
                    aria-label={`Open ${item.name} visualizer`}
                  >
                    <div className="algo-card-topline">
                      <span className="algo-icon">{item.icon}</span>
                      <span className="algo-complexity">{item.complexity}</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.tagline}</p>
                    <div className="algo-badges">
                      <span>{item.level}</span>
                      <span>{item.pattern}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* How it works */}
        <FadeInSection>
          <section className="section how-section">
            <div className="container">
              <h2 style={{ fontSize: '2.5rem', textAlign: 'center', margin: '0 0 3rem 0' }}>How it works</h2>
              
              <div className="timeline">
                <div className="timeline-step">
                  <div className="step-number">1</div>
                  <div className="step-card">
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Choose a problem</h4>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Select the dynamic programming algorithm you want to study.</p>
                  </div>
                </div>
                
                <div className="timeline-step">
                  <div className="step-number">2</div>
                  <div className="step-card">
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Step through execution</h4>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Use the controls to manually advance or auto-play through logic branches.</p>
                  </div>
                </div>
                
                <div className="timeline-step">
                  <div className="step-number">3</div>
                  <div className="step-card">
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Observe state transitions</h4>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Watch exactly how variables and matrices update inside memory.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* About Section */}
        <FadeInSection>
          <section className="section about-section" id="about-dp-studio">
            <div className="container">
              <h2 style={{ fontSize: '2.5rem', textAlign: 'center', margin: '0 0 1rem 0' }}>About DP Studio</h2>
              <p style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem auto', fontSize: '1.1rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                An interactive educational platform for mastering Dynamic Programming through real-time visualization, live code sync, and step-driven exploration.
              </p>
              <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                <FeatureCard delay={0}>
                  <h3 style={{ color: '#22d3ee', margin: '0 0 0.75rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.6))' }}>🎓</span> Educational Purpose
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55, fontSize: '0.95rem' }}>
                    Designed for students, educators, and competitive programmers to build deep intuition for DP paradigms through interactive, visual learning.
                  </p>
                </FeatureCard>
                <FeatureCard delay={0.15} className="feature-card--highlighted">
                  <h3 style={{ color: '#34d399', margin: '0 0 0.75rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.6))' }}>📊</span> 6 Algorithms
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55, fontSize: '0.95rem' }}>
                    Fibonacci, 0/1 Knapsack, LIS, MCM, LCS, and Edit Distance — covering 1D, 2D, String, Sequence, and Partition DP.
                  </p>
                </FeatureCard>
                <FeatureCard delay={0.3}>
                  <h3 style={{ color: '#c084fc', margin: '0 0 0.75rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ filter: 'drop-shadow(0 0 8px rgba(192,132,252,0.6))' }}>⚡</span> Interactive Learning
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55, fontSize: '0.95rem' }}>
                    Step-by-step execution, side-by-side approach comparison, synchronized code highlighting, and DP table animations.
                  </p>
                </FeatureCard>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Final CTA */}
        <FadeInSection>
          <section className="section cta-section">
            <div className="container final-cta-container" style={{ textAlign: 'center' }}>
              <div className="final-cta-bg"></div>
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 2rem 0', position: 'relative', zIndex: 1 }}>Start learning DP the intuitive way</h2>
              <button 
                onClick={() => navigate('/visualizer')}
                className="launch-btn launch-btn-final"
                style={{ color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Launch Visualizer
              </button>
            </div>
          </section>
        </FadeInSection>
      </main>
    </div>
  );
};
