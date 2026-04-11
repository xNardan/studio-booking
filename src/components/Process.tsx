"use client";

import React from 'react';
import { MessageSquare, CalendarCheck, Mic2, Sliders, Music } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "1. Kontakt",
    description: "Podbij do nas na Instagramie. Szybko dogadamy Twój pomysł, potrzeby i sprawdzimy, co możemy razem zdziałać.",
    icon: MessageSquare,
  },
  {
    title: "2. Rezerwacja",
    description: "Ustalamy konkretny termin, który Ci pasuje. Rezerwujemy studio i szykujemy sprzęt pod Twoje nagrywki.",
    icon: CalendarCheck,
  },
  {
    title: "3. Sesja nagraniowa",
    description: "Wbijasz do studia i robimy swoje. Nagrywamy w luźnej atmosferze, bez spiny, żeby wyciągnąć z Ciebie to, co najlepsze.",
    icon: Mic2,
  },
  {
    title: "4. Miks i mastering",
    description: "Bierzemy Twój materiał na warsztat. Szlifujemy brzmienie tak, żeby Twój numer brzmiał po prostu mainstreamowo.",
    icon: Sliders,
  },
  {
    title: "5. Gotowy utwór",
    description: "Dostajesz od nas finalny plik w najwyższej jakości. Twój kawałek jest gotowy, żeby lecieć na Spotify i YouTube.",
    icon: Music,
  }
];

const Process = () => {
  return (
    <section id="process" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Jak działamy?</h2>
          <p className="text-muted-foreground">Twój proces twórczy w pięciu prostych krokach.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <Card key={index} className="border-none shadow-md bg-secondary/20 rounded-3xl hover:bg-secondary/40 transition-colors">
              <CardContent className="pt-8 pb-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-gray-accent text-primary-foreground rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <step.icon size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;