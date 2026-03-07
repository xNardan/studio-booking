"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone } from 'lucide-react';
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/utils/toast";

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const BookingForm = () => {
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Symulacja wysyłania
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
            <p className="text-muted-foreground">Wypełnij formularz, a my potwierdzimy Twoją sesję.</p>
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
                <Label htmlFor="time">Godzina</Label>
                <Select required>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Wybierz godzinę" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
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
                disabled={loading}
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