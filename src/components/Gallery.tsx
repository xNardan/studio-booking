"use client";

import React from 'react';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import img1 from '@/assets/gallery/img1.jpg';
import img2 from '@/assets/gallery/img2.jpg';
import img3 from '@/assets/gallery/img3.jpg';
import img4 from '@/assets/gallery/img4.jpg';
import img5 from '@/assets/gallery/img5.jpg';
import img6 from '@/assets/gallery/img6.jpg';

const images = [img1, img2, img3, img4, img5, img6];

const Gallery = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nasze Studio</h2>
          <p className="text-muted-foreground">Zobacz, gdzie powstaje Twoja muzyka.</p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {images.map((src, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <div className="overflow-hidden rounded-[2rem] shadow-2xl aspect-video md:aspect-[21/9]">
                      <img 
                        src={src} 
                        alt={`Studio photo ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Gallery;