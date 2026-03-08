"use client";

import React from 'react';
import { Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-1.5 rounded-lg">
            <Music className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Flow Studio</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/#services" className="hover:text-primary transition-colors">Usługi</a>
          <a href="/#about" className="hover:text-primary transition-colors">O nas</a>
          <Link to="/rezerwacja" className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-bold">
            Zarezerwuj
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;