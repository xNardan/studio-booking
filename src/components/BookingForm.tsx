"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, Mail, Phone, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfToday, getDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from '@/lib/supabase';

const dayMap: Record<number, string> = {
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
  6: "Sobota",
  0: "Niedziela"
};

const BookingForm = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbAvailability, setDbAvailability] = useState<Record<string, string[]>>({});
  
  // Generujemy listę najbliższych 7 dni
  const nextSevenDays = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data, error } = await supabase.from('availability').select('*');
      if (error) {
        console.error("Błąd pobierania dostępności:", error);
      } else if (data) {
        const formatted = data.reduce((acc: any, curr: any) => {
          acc[curr.day_name] = curr.hours;
          return acc;
        }, {});
        setDbAvailability(formatted);
      }
    };
    fetchAvailability();
  }, []);

  const getHoursForDate = (date: Date) => {
    const dayName = dayMap[getDay(date)];
    return dbAvailability[dayName] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedHour) return;
    
    setLoading(true);
    // Symulacja zapisu
    setTimeout(() => {
      setLoading(false);
      showSuccess(`Zarezerwowano termin: ${format(selectedDate, "dd.MM")} o godzinie ${selectedHour}`);
      setSelectedDate(null);
      setSelectedHour(null);
    }, 1500);
  };

  return (
    <section id="booking" className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Zarezerwuj sesję</h2>
            <p className="text-muted-foreground text-lg">Wybierz dogodny termin z naszego grafiku.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* KROK 1: Wybór daty i godziny */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <CalendarIcon className="text-primary w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">1. Wybierz termin</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
                  {nextSevenDays.map((date) => {
                    const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    const hasHours = getHoursForDate(date).length > 0;
                    
                    return (
                      <button
                        key={date.toString()}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedHour(null);
                        }}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                          isSelected 
                            ? "border-primary bg-primary/5 scale-105" 
                            : "border-transparent bg-secondary/30 hover:bg-secondary/50",
                          !hasHours && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className="text-xs font-bold uppercase text-muted-foreground mb-1">
                          {format(date, "EEE", { locale: pl })}
                        </span>
                        <span className="text-xl font-extrabold">
                          {format(date, "d")}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedDate ? (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-muted-foreground">
                      <Clock size={16} />
                      DOSTĘPNE GODZINY ({format(selectedDate, "EEEE, d MMMM", { locale: pl })}):
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {getHoursForDate(selectedDate).length > 0 ? (
                        getHoursForDate(selectedDate).map((hour) => (
                          <button
                            key={hour}
                            onClick={() => setSelectedHour(hour)}
                            className={cn(
                              "py-3 px-2 rounded-xl text-sm font-bold transition-all border-2",
                              selectedHour === hour
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:border-primary/50"
                            )}
                          >
                            {hour}
                          </button>
                        ))
                      ) : (
                        <p className="col-span-full text-center py-8 text-muted-foreground italic">
                          Brak dostępnych godzin w tym dniu.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl">
                    <p className="text-muted-foreground">Wybierz dzień powyżej, aby zobaczyć godziny.</p>
                  </div>
                )}
              </div>
            </div>

            {/* KROK 2: Formularz danych */}
            <div className={cn(
              "transition-all duration-500",
              (!selectedDate || !selectedHour) ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
            )}>
              <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="text-primary w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">2. Twoje dane</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Usługa</Label>
                    <Select required>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Wybierz usługę" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recording">Nagrywanie wokalu</SelectItem>
                        <SelectItem value="mixing">Miks i Mastering</SelectItem>
                        <SelectItem value="production">Produkcja muzyczna</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Imię / Pseudonim</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input id="name" placeholder="Twoje imię" className="pl-10 rounded-xl h-12" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="twoj@email.com" className="pl-10 rounded-xl h-12" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input id="phone" type="tel" placeholder="+48 000 000 000" className="pl-10 rounded-xl h-12" required />
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="bg-secondary/50 p-4 rounded-2xl mb-4 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Termin:</span>
                        <span className="font-bold">
                          {selectedDate && selectedHour 
                            ? `${format(selectedDate, "dd.MM")} @ ${selectedHour}` 
                            : "Nie wybrano"}
                        </span>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-2xl text-lg font-bold" 
                      disabled={loading || !selectedDate || !selectedHour}
                    >
                      {loading ? "Wysyłanie..." : "Potwierdź rezerwację"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;