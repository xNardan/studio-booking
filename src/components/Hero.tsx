"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import studioInterior from '@/assets/studio-interior.png'; // Importuj nowe zdjęcie

const Hero = () => {
  return (
    <section className="pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto text-center md:text-left">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Flow Studio
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Twoje brzmienie, nasza pasja.
            </p>
          </div>
          <div className="md:w-1/2 flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
            <Link to="/rezerwacja" className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Zarezerwuj sesję
            </Link>
          </div>
        </div>
        <div className="mt-16 max-w-4xl mx-auto">
          <img 
            src={studioInterior} 
            alt="Wnętrze studia nagrań Flow Studio" 
            className="w-full h-auto object-cover rounded-[2.5rem] shadow-2xl" 
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;