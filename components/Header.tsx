import React, { useState } from 'react';
import Clock from './Clock';
import { SunIcon, MoonIcon } from './Icons';

interface NavLink {
  name: string;
  ref: React.RefObject<HTMLElement>;
}

interface HeaderProps {
  navLinks: NavLink[];
  scrollToSection: (ref: React.RefObject<HTMLElement>) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ navLinks, scrollToSection, isDarkMode, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md dark:shadow-black/20">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div>
           <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
             وکیل امیرحسین بای
           </h1>
           <p className="text-xs text-blue-600 dark:text-amber-400 font-semibold">متعهد به دفاع از حقوق شما</p>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.ref)}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 font-semibold transition-colors duration-300"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-blue-600" />}
          </button>

          <div className="hidden md:block">
              <Clock />
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-800 dark:text-slate-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <nav className="flex flex-col items-center py-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  scrollToSection(link.ref);
                  setIsMenuOpen(false);
                }}
                className="py-2 w-full text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 font-semibold transition-colors duration-300"
              >
                {link.name}
              </button>
            ))}
             <div className="mt-4">
                <Clock />
             </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;