"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import { ArrowLeft, MapPin } from 'lucide-react';
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
      
      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-left">
            <h4 className="text-lg font-bold mb-4 text-gray-400">ADRES</h4>
            <p className="text-gray-300">Al. Jana Pawła II 11</p>
            <p className="text-gray-300">21-500 Biała Podlaska</p>
          </div>
          <div className="text-left">
            <h4 className="text-lg font-bold mb-4 text-gray-400">KONTAKT</h4>
            <p className="text-gray-300">@flowstudio.bp</p>
            <p className="text-gray-300">flowstudiobp@gmail.com</p>
          </div>
          <div className="text-right">
            <a 
              href="https://www.google.com/maps/search/Al.+Jana+Paw%C5%82a+II+11,+21-500+Bia%C5%82a+Podlaska" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              <MapPin size={20} /> Znajdź nas na Google
            </a>
          </div>
        </div>
        <div className="container mx-auto px-4 text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">© 2024 Flow Studio. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;