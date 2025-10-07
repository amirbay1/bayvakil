import React, { useRef, useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FAQ from './components/FAQ';
import LegalOpinion from './components/LegalOpinion';
import AnimatedSection from './components/AnimatedSection';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (localStorage.theme === 'dark') return true;
    if (localStorage.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'خانه', ref: homeRef },
    { name: 'خدمات', ref: servicesRef },
    { name: 'درباره', ref: aboutRef },
    { name: 'سوالات متداول', ref: faqRef },
    { name: 'تماس', ref: contactRef },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Header 
        navLinks={navLinks} 
        scrollToSection={scrollToSection} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <main>
        <div ref={homeRef}>
          <Hero />
        </div>
        <AnimatedSection ref={servicesRef}>
          <Services />
        </AnimatedSection>
        <AnimatedSection ref={aboutRef}>
          <About />
        </AnimatedSection>
        <AnimatedSection>
            <LegalOpinion />
        </AnimatedSection>
        <AnimatedSection ref={faqRef}>
          <FAQ />
        </AnimatedSection>
        <div ref={contactRef}>
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;