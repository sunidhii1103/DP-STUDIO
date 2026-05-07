import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { algorithmShowcase } from '../constants/algorithmShowcase';
import type { AlgorithmShowcaseItem } from '../constants/algorithmShowcase';

interface FeatureCardProps {
  children: React.ReactNode;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ children, delay = 0 }) => {
  const [ref, isVisible] = useInView();

  return (
    <div
      ref={ref}
      className={`panel feature-card ${isVisible ? "show" : ""}`}
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

  const launchAlgorithm = (item: AlgorithmShowcaseItem) => {
    const params = new URLSearchParams({ algo: item.id, ...item.launchParams });
    navigate(`/visualizer?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text-primary)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Hero Background Glow */}
      <div className="hero-bg"></div>

      {/* Navbar */}
      <header style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', alignItems: 'center' }}>
          <div className="logo logo-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.png" alt="DP Studio" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
            <span style={{ fontSize: '1.25rem' }}>DP Studio</span>
          </div>
          <button 
            onClick={() => navigate('/visualizer')}
            className="launch-btn"
            style={{ padding: '0.6rem 1.5rem', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
          >
            Launch App
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', zIndex: 10 }}>
        
        {/* 2. Hero (+ Demo, Glass Panel) */}
        <section className="section hero-section">
          <div className="container" style={{ textAlign: 'center', opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            <h1 className="hero-title" style={{ fontSize: '4rem', fontWeight: 800, margin: '0 0 1.5rem 0' }}>
              Master Dynamic Programming Visually
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
              Built for learning, debugging, and mastering Dynamic Programming.
            </p>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '650px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
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

        {/* 3. Features (Concise) */}
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

        {/* 4. Algorithm Showcase */}
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

        {/* 5. How it works */}
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

        {/* 6. Final CTA */}
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
