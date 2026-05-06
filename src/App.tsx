import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { VisualizerPage } from './pages/VisualizerPage';

export const App: React.FC = () => {
  useEffect(() => {
    document.title = "DP Studio";

    const glow = document.querySelector(".cursor-glow") as HTMLElement;
    if (!glow) return;

    const move = (e: MouseEvent) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div className="cursor-glow"></div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/visualizer" element={<VisualizerPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};
