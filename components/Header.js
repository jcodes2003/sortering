"use client";
import React, { useEffect, useState } from "react";

export default function Header() {
  const [theme, setTheme] = useState("light");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      // Get saved theme from localStorage
      const savedTheme = localStorage.getItem("theme");
      
      if (savedTheme) {
        setTheme(savedTheme);
        // Apply the saved theme
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Check system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = prefersDark ? "dark" : "light";
        setTheme(initialTheme);
        
        if (initialTheme === "dark") {
          document.documentElement.classList.add("dark");
        }
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Update localStorage
    localStorage.setItem("theme", newTheme);
    
    // Update DOM classes
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    console.log("Theme changed to:", newTheme); // Debug log
  };

  return (
    <header className="w-full py-6 px-8 flex items-center justify-between shadow-lg backdrop-blur-md bg-white/80 dark:bg-gray-900/80 sticky top-0 z-40 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center gap-6 group cursor-pointer">
        <div 
          className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isHovered ? 'animate-pulse' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          S
        </div>
        <div className="transform transition-all duration-300 group-hover:translate-x-1">
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sort Attendance
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Upload, filter and track attendance
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle light / dark"
          className="flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          {theme === "dark" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 animate-spin-slow" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a.75.75 0 01.75.75V4a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM10 16a.75.75 0 01.75.75V18a.75.75 0 01-1.5 0v-1.25A.75.75 0 0110 16zM4.22 4.22a.75.75 0 011.06 0l.88.88a.75.75 0 11-1.06 1.06l-.88-.88a.75.75 0 010-1.06zM14.84 14.84a.75.75 0 011.06 0l.88.88a.75.75 0 11-1.06 1.06l-.88-.88a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75H4a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm14 0a.75.75 0 01.75-.75H18a.75.75 0 010 1.5h-1.25A.75.75 0 0116 10zM4.22 15.78a.75.75 0 010-1.06l.88-.88a.75.75 0 111.06 1.06l-.88.88a.75.75 0 01-1.06 0zM14.84 5.16a.75.75 0 010-1.06l.88-.88a.75.75 0 111.06 1.06l-.88.88a.75.75 0 01-1.06 0zM10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 animate-bounce" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
            </svg>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {theme === "dark" ? "Dark" : "Light"}
          </span>
        </button>
      </div>
    </header>
  );
}