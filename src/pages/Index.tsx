"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { MapPin, Mail, Instagram, Phone, Mic, Headphones, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; // Import Label

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Services />

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
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img src="/pasted-image-2026-03-08T14-08-52-013Z.png" alt="Studio Interior" className="w-full h-auto object-cover" />
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Users className="text-primary w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">Doświadczony zespół</h3>
                    <p className="text-muted-foreground">Nasi realizatorzy to pasjonaci z wieloletnim doświadczeniem w branży muzycznej.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Headphones className="text-primary w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-1">Najwyższa jakość dźwięku</h3>
                    <p className="text-muted-foreground">Dbamy o każdy detal, aby Twoje nagrania brzmiały perfekcyjnie.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mic className="text-primary w-8 h-8 flex-shrink-0" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <li>behringer studio L</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Monitory Odsłuchowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>krk rokit 5</li>
                    <li>Beyerdynamic DT 770 Pro 80Ohm</li>
                    <li>Superlux HD-660 Pro 150 Ohm</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl">Oprogramowanie (DAW)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>FL studio 2025</li>
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
                Masz pytania? Chcesz omówić swój projekt? Napisz do nas lub zadzwoń!
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="border-none shadow-lg rounded-3xl p-6">
                  <CardTitle className="mb-4 text-xl">Napisz do nas</CardTitle>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="contact-name">Imię</Label>
                      <Input id="contact-name" placeholder="Twoje imię" className="rounded-xl h-12" />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input id="contact-email" type="email" placeholder="twoj@email.com" className="rounded-xl h-12" />
                    </div>
                    <div>
                      <Label htmlFor="contact-message">Wiadomość</Label>
                      <Textarea id="contact-message" placeholder="Twoja wiadomość..." rows={5} className="rounded-xl" />
                    </div>
                    <Button type="submit" className="w-full rounded-full font-bold h-12">Wyślij wiadomość</Button>
                  </form>
                </Card>
                <Card className="border-none shadow-lg rounded-3xl p-6">
                  <CardTitle className="mb-4 text-xl">Znajdź nas</CardTitle>
                  <div className="flex items-center gap-4 mb-4">
                    <Mail className="text-primary w-6 h-6" />
                    <a href="mailto:kontakt@flowstudio.pl" className="text-lg hover:text-primary transition-colors">kontakt@flowstudio.pl</a>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <Phone className="text-primary w-6 h-6" />
                    <a href="tel:+48123456789" className="text-lg hover:text-primary transition-colors">+48 123 456 789</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <Instagram className="text-primary w-6 h-6" />
                    <a href="https://instagram.com/flowstudio" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-primary transition-colors">@flowstudio</a>
                  </div>
                </Card>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-xl h-[400px] lg:h-auto">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.9100400000003!2d19.94497991571749!3d50.06143007942309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47165b0000000001%3A0x123456789abcdef0!2sRynek%20G%C5%82%C3%B3wny%2C%20Krak%C3%B3w!5e0!3m2!1spl!2spl!4v1678901234567!5m2!1spl!2spl"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokalizacja Flow Studio"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
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