"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 rounded-full hover:bg-secondary">
              <ArrowLeft size={18} /> Powrót do strony głównej
            </Button>
          </Link>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Zarezerwuj swoją <span className="text-primary">sesję</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Wybierz usługę, datę i godzinę. Nasz system automatycznie sprawdzi dostępność realizatora.
            </p>
          </div>
        </div>

        <BookingForm />
      </main>
      
      <footer className="py-12 border-t border-border bg-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">© 2024 Flow Studio. Wszystkie prawa zastrzeżone.</p>
        </div>
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default BookingPage;