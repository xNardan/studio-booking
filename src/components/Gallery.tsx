"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import img1 from '@/assets/gallery/img1.jpg';
import img2 from '@/assets/gallery/img2.jpg';
import img3 from '@/assets/gallery/img3.jpg';
import img4 from '@/assets/gallery/img4.jpg';
import img5 from '@/assets/gallery/img5.jpg';
import img6 from '@/assets/gallery/img6.jpg';

const images = [
  { src: img1, alt: "Kabina nagraniowa Flow Studio Biała Podlaska" },
  { src: img2, alt: "Sprzęt studyjny Flow Studio — interfejs audio i monitory" },
  { src: img3, alt: "Mikrofon studyjny t.bone SC 600 w Flow Studio" },
  { src: img4, alt: "Miejsce pracy realizatora dźwięku Flow Studio" },
  { src: img5, alt: "Wnętrze studia nagrań Flow Studio Biała Podlaska" },
  { src: img6, alt: "Sesja nagraniowa w Flow Studio" },
];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nasze Studio</h2>
          <p className="text-muted-foreground">Zobacz, gdzie powstaje Twoja muzyka.</p>
        </div>
        
        <div className="max-w-4xl mx-auto relative group">
          <div className="overflow-hidden rounded-[2rem] shadow-2xl aspect-square md:aspect-video relative bg-secondary/20">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>
          
          {/* Wskaźniki (kropki) */}
          <div className="flex justify-center gap-2 mt-6">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "bg-gray-accent w-6" 
                    : "bg-secondary hover:bg-gray-accent/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;