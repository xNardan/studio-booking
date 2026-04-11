"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Process from '@/components/Process';
import { Mail, Instagram, Mic, Headphones, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import hero2Image from '@/assets/hero2.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-gray-accent/30">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />

        {/* About Section */}
        <section id="about" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">O nas</h2>
              <p className="text-muted-foreground text-lg">
                Flow Studio to nowoczesne studio nagrań, stworzone z pasji do muzyki i dźwięku. Oferujemy profesjonalne usługi nagraniowe, miks i mastering oraz produkcję muzyczną. Naszym celem jest zapewnienie artystom idealnych warunków do tworzenia i rozwijania ich twórczości.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="rounded-3xl overflow-hidden shadow-xl bg-secondary">
                <img 
                  src={hero2Image} 
                  alt="Wnętrze Flow Studio" 
                  className="w-full h-auto object-cover" 
                  loading="lazy"
                  width="800"
                  height="600"
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Users className="text-gray-accent w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">Doświadczony zespół</h3>
                    <p className="text-muted-foreground">Nasi realizatorzy to pasjonaci z wieloletnim doświadczeniem w branży muzycznej.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Headphones className="text-gray-accent w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">Najwyższa jakość dźwięku</h3>
                    <p className="text-muted-foreground">Dbamy o każdy detal, aby Twoje nagrania brzmiały perfekcyjnie.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mic className="text-gray-accent w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">Kreatywna atmosfera</h3>
                    <p className="text-muted-foreground">Stwarzamy inspirujące środowisko, które sprzyja twórczości.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Section */}
        <section id="equipment" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nasz sprzęt</h2>
              <p className="text-muted-foreground text-lg">
                Pracujemy na sprawdzonym i nowoczesnym sprzęcie, aby zapewnić najwyższą jakość Twoich produkcji.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Mikrofony</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>t.bone SC 600</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Interfejsy Audio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Behringer Studio L</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Słuchawki i Monitory Odsłuchowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>KRK Rokit 5</li>
                    <li>PreSonus Eris 5</li>
                    <li>Beyerdynamic DT 770 Pro 80 Ohm</li>
                    <li>Superlux HD-660 Pro 150 Ohm</li>
                    <li>Beyerdynamic DT 990 Pro 250 Ohm</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Oprogramowanie (DAW)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>FL Studio 2025</li>
                    <li>Reaper</li>
                    <li>Waves</li>
                    <li>FabFilter</li>
                    <li>Valhalla</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Skontaktuj się z nami</h2>
              <p className="text-muted-foreground text-lg">
                Chcesz omówić swój projekt? Napisz do nas na Instagramie!
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <Card className="border-none shadow-lg rounded-3xl p-8 text-center">
                <CardTitle className="mb-6 text-2xl">Nasze kanały</CardTitle>
                <div className="flex flex-col items-center gap-8">
                  <a 
                    href="https://instagram.com/flowstudio.bp" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-4 text-xl font-bold hover:text-gray-accent transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-accent text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Instagram size={28} />
                    </div>
                    @flowstudio.bp
                  </a>
                  <div className="flex items-center gap-4 text-lg text-muted-foreground">
                    <Mail className="w-6 h-6" />
                    <a href="mailto:flowstudiobp@gmail.com" className="hover:text-gray-accent transition-colors">flowstudiobp@gmail.com</a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
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

export default Index;