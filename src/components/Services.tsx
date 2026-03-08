"use client";

import React from 'react';
import { Mic, Headphones, Music2, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const services = [
  {
    title: "Nagrywanie wokalu",
    description: "Profesjonalna kabina lektorska i najlepsze mikrofony dla Twojego głosu.",
    icon: Mic,
    price: "od 150 zł/h"
  },
  {
    title: "Miks i Mastering",
    description: "Nadamy Twoim utworom radiowe brzmienie i odpowiednią dynamikę.",
    icon: Headphones,
    price: "od 400 zł/utwór"
  },
  {
    title: "Produkcja muzyczna",
    description: "Pomożemy Ci stworzyć aranżację od podstaw w dowolnym gatunku.",
    icon: Music2,
    price: "wycena indywidualna"
  },
  {
    title: "Podcasty",
    description: "Kompletne rozwiązanie dla twórców treści audio i wideo.",
    icon: Radio,
    price: "od 200 zł/h"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nasze Usługi</h2>
          <p className="text-muted-foreground">Wybierz to, czego potrzebuje Twój projekt.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow rounded-3xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-yellow/10 rounded-2xl flex items-center justify-center mb-4">
                  <service.icon className="text-yellow w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-yellow">{service.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;