"use client";

import React from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto text-center md:text-left">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              STUDIO JEST OTWARTE
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Twoje brzmienie, <span className="text-yellow">nasza pasja.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Flow Studio to miejsce, gdzie technologia spotyka się z kreatywnością. Nagrywaj, miksuj i twórz muzykę na najwyższym poziomie.
            </p>
          </div>
          <div className="md:w-1/2 flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
            <Link to="/rezerwacja" className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Zarezerwuj sesję
            </Link>
            <button className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" /> Zobacz studio
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;