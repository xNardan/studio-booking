"use client";

import React from 'react';
import heroImage from '@/assets/hero.jpg';

const Hero = () => {
  return (
    <section 
      className="relative h-[70vh] md:h-[80vh] flex items-center justify-center text-center overflow-hidden rounded-b-[3rem] shadow-2xl"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50 rounded-b-[3rem]"></div>
      <div className="relative z-10 text-white p-4 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
          Flow Studio
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Twoje brzmienie, nasza pasja.
        </p>
        <a 
          href="https://instagram.com/flowstudio.bp" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-gray-accent text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform inline-flex items-center justify-center gap-2"
        >
          Zarezerwuj sesję przez Instagram
        </a>
      </div>
    </section>
  );
};

export default Hero;