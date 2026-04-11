"use client";

import React from 'react';
import { ModeToggle } from './ModeToggle';
import logo from '@/assets/flowstudiologo.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Przejdź do góry strony"
        >
          <img src={logo} alt="Flow Studio Logo" className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">Flow Studio</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="/#services" className="hover:text-gray-accent transition-colors">Usługi</a>
            <a href="/#about" className="hover:text-gray-accent transition-colors">O nas</a>
            <a href="/#equipment" className="hover:text-gray-accent transition-colors">Sprzęt</a>
            <a href="/#contact" className="hover:text-gray-accent transition-colors">Kontakt</a>
            <a 
              href="https://instagram.com/flowstudio.bp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-bold"
            >
              Zarezerwuj
            </a>
          </div>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;