"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import { Mail, Instagram, Mic, Headphones, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import hero2Image from '@/assets/hero2.jpg';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loadingContact, setLoadingContact] = useState(false);

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setContactForm(prev => ({ ...prev, [id.replace('contact-', '')]: value }));
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Podstawowa walidacja formatu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      showError("Proszę podać poprawny adres e-mail.");
      return;
    }

    setLoadingContact(true);

    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          isContactForm: true 
        }
      });

      if (error) throw error;

      showSuccess("Twoja wiadomość została wysłana!");
      setContactForm({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error("Błąd wysyłania wiadomości:", error);
      showError("Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.");
    } finally {
      setLoadingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-gray-accent/30">
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
                Masz pytania? Chcesz omówić swój projekt? Napisz do nas!
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <Card className="border-none shadow-lg rounded-3xl p-6">
                  <CardTitle className="mb-4 text-xl">Napisz do nas</CardTitle>
                  <form onSubmit={handleSubmitContactForm} className="space-y-4">
                    <div>
                      <Label htmlFor="contact-name">Imię</Label>
                      <Input 
                        id="contact-name" 
                        placeholder="Twoje imię" 
                        className="rounded-xl h-12" 
                        value={contactForm.name}
                        onChange={handleContactInputChange}
                        disabled={loadingContact}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input 
                        id="contact-email" 
                        type="email" 
                        placeholder="twoj@email.com" 
                        className="rounded-xl h-12" 
                        value={contactForm.email}
                        onChange={handleContactInputChange}
                        disabled={loadingContact}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-message">Wiadomość</Label>
                      <Textarea 
                        id="contact-message" 
                        placeholder="Twoja wiadomość..." 
                        rows={5} 
                        className="rounded-xl" 
                        value={contactForm.message}
                        onChange={handleContactInputChange}
                        disabled={loadingContact}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full font-bold h-12" disabled={loadingContact}>
                      {loadingContact ? "Wysyłanie..." : "Wyślij wiadomość"}
                    </Button>
                  </form>
                </Card>
                <Card className="border-none shadow-lg rounded-3xl p-6">
                  <CardTitle className="mb-4 text-xl">Nasze kanały</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-4">
                      <Mail className="text-gray-accent w-6 h-6" />
                      <a href="mailto:flowstudiobp@gmail.com" className="text-lg hover:text-gray-accent transition-colors">flowstudiobp@gmail.com</a>
                    </div>
                    <div className="flex items-center gap-4">
                      <Instagram className="text-gray-accent w-6 h-6" />
                      <a href="https://instagram.com/flowstudio.bp" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-gray-accent transition-colors">@flowstudio.bp</a>
                    </div>
                  </div>
                </Card>
              </div>
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