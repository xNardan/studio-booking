"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-gray-accent/30">
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
          </div>
        </div>

        <BookingForm />
      </main>
      
      <footer className="bg-card text-foreground py-12 border-t border-border">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="text-left">
            <h4 className="text-lg font-bold mb-4 text-muted-foreground">KONTAKT</h4>
            <p className="text-base">@flowstudio.bp</p>
            <p className="text-base">flowstudiobp@gmail.com</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-muted-foreground text-sm">© 2026 Flow Studio. Wszelkie prawa zastrzeżone.</p>
            <Link to="/privacy-policy" className="text-muted-foreground text-sm hover:text-gray-accent transition-colors block mt-2">Polityka Prywatności</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;