"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import BookingForm from '@/components/BookingForm';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <BookingForm />
      </main>
      <footer className="py-12 border-t border-border bg-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">© 2024 Flow Studio. Wszystkie prawa zastrzeżone.</p>
          <div className="flex justify-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">Facebook</a>
            <a href="#" className="hover:text-primary transition-colors">YouTube</a>
          </div>
        </div>
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;