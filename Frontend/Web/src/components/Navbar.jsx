import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDarkMode = savedTheme === 'dark';
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <nav
        className="fixed top-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-black dark:text-white tracking-tight">
                INDEV.Ai
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors duration-200"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors duration-200"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('startups')}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors duration-200"
              >
                Startups
              </button>
              <button 
                onClick={() => scrollToSection('investors')}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors duration-200"
              >
                Investors
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={18} className="text-black" /> : <Moon size={18} className="text-gray-600" />}
              </button>

              {/* Auth Buttons */}
              <button className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors duration-200">
                Sign In
              </button>
              <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}