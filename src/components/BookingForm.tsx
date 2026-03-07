"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, User, Mail, Phone } from 'lucide-react';
import { format, getDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [dbAvailability, setDbAvailability] = useState<Record<string, string[]>>({});

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

  const availableHours = useMemo(() => {
    if (!date) return [];
    const dayName = dayMap[getDay(date)];
    return dbAvailability[dayName] || [];
  }, [date, dbAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Tutaj można dodać zapis rezerwacji do tabeli 'bookings'
    setTimeout(() => {
      setLoading(false);
      showSuccess("Rezerwacja została wysłana! Skontaktujemy się z Tobą wkrótce.");
    }, 1500);
  };

  return (
    <section id="booking" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Zarezerwuj termin</h2>
            <p className="text-muted-foreground">Wybierz datę, aby zobaczyć dostępne godziny.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
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
                <Label>Data sesji</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 rounded-xl",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={pl}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Dostępne godziny</Label>
                <Select required disabled={!date || availableHours.length === 0}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder={!date ? "Najpierw wybierz datę" : availableHours.length === 0 ? "Brak wolnych terminów" : "Wybierz godzinę"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHours.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Imię i Nazwisko / Pseudonim</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input id="name" placeholder="Jan Kowalski" className="pl-10 rounded-xl h-12" required />
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

              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-lg font-bold mt-4" 
                disabled={loading || !date || availableHours.length === 0}
              >
                {loading ? "Wysyłanie..." : "Potwierdź rezerwację"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;