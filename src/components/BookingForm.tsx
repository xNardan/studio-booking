"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, Mail, Instagram, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfToday, getDay, parseISO, addHours, isBefore, isAfter, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';

const dayMap: Record<number, string> = {
  0: "Niedziela",
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
  6: "Sobota"
};

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"]; // Przeniesiono definicję days tutaj

const BookingForm = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [numberOfHours, setNumberOfHours] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [dbAvailability, setDbAvailability] = useState<Record<string, string[]>>({});
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    service: 'recording',
    name: '',
    email: '',
    instagram: ''
  });

  const nextSevenDays = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAvailability();
      await fetchExistingBookings();
    };
    fetchData();
  }, []);

  const fetchAvailability = async () => {
    const { data, error } = await supabase.from('availability').select('*');
    if (error) {
      console.error("Błąd pobierania dostępności:", error);
    } else {
      const formatted: Record<string, string[]> = {};
      // Initialize all days with empty arrays
      days.forEach(day => { // 'days' jest teraz dostępne
        formatted[day] = [];
      });
      
      // Fill with data from DB
      if (data) {
        data.forEach((curr: any) => {
          formatted[curr.day_name] = curr.hours;
        });
      }
      setDbAvailability(formatted);
    }
  };

  const fetchExistingBookings = async () => {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) {
      console.error("Błąd pobierania istniejących rezerwacji:", error);
    } else if (data) {
      setExistingBookings(data);
    }
  };

  const getAvailableHours = (date: Date, hoursCount: number) => {
    const allPossibleHours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

    return allPossibleHours.filter(startHour => {
      const bookingStart = setMilliseconds(setSeconds(setMinutes(setHours(date, parseInt(startHour.split(':')[0])), 0), 0), 0), 0);
      const bookingEnd = addHours(bookingStart, hoursCount);

      // 1. Sprawdź dostępność w grafiku administratora dla każdej godziny w ramach rezerwacji
      for (let i = 0; i < hoursCount; i++) {
        const currentCheckTime = addHours(bookingStart, i);
        const currentCheckHourFormatted = format(currentCheckTime, 'HH:00');
        const currentCheckDayName = dayMap[getDay(currentCheckTime)];
        
        const dayAvailability = dbAvailability[currentCheckDayName];

        if (!dayAvailability || !dayAvailability.includes(currentCheckHourFormatted)) {
          return false; // Godzina nie jest dostępna w grafiku administratora
        }
      }

      // 2. Sprawdź kolizje z istniejącymi rezerwacjami
      const relevantBookings = existingBookings.filter(existingBooking => {
        const existingBookingDate = parseISO(existingBooking.booking_date);
        const existingBookingStart = setMilliseconds(setSeconds(setMinutes(setHours(existingBookingDate, parseInt(existingBooking.booking_hour.split(':')[0])), 0), 0), 0);
        const existingBookingEnd = addHours(existingBookingStart, existingBooking.number_of_hours);

        // Sprawdzamy, czy istniejąca rezerwacja nakłada się na naszą potencjalną rezerwację
        // Używamy isBefore i isAfter, aby sprawdzić, czy interwały się przecinają
        return (
          (isBefore(bookingStart, existingBookingEnd) && isAfter(bookingEnd, existingBookingStart)) ||
          (bookingStart.getTime() === existingBookingStart.getTime() && bookingEnd.getTime() === existingBookingEnd.getTime())
        );
      });

      if (relevantBookings.length > 0) {
        return false; // Kolizja z istniejącą rezerwacją
      }
      
      return true; // Godzina jest dostępna
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedHour || !formData.service || !formData.name || !formData.email || !formData.instagram || !numberOfHours) {
      showError("Proszę wypełnić wszystkie pola.");
      return;
    }
    
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          service: formData.service,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_instagram: formData.instagram,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          booking_hour: selectedHour,
          number_of_hours: parseInt(numberOfHours)
        });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error("Przepraszamy, ten termin został właśnie zarezerwowany przez kogoś innego.");
        }
        if (insertError.code === 'P0001') {
          throw new Error(insertError.message);
        }
        throw insertError;
      }

      showSuccess(`Zarezerwowano termin: ${format(selectedDate, "dd.MM")} o godzinie ${selectedHour} na ${numberOfHours} godzin.`);
      
      setSelectedDate(null);
      setSelectedHour(null);
      setNumberOfHours('1');
      setFormData({ service: 'recording', name: '', email: '', instagram: '' });
      fetchExistingBookings(); // Odśwież listę rezerwacji po udanej rezerwacji
      
    } catch (error: any) {
      showError(error.message || "Wystąpił błąd podczas rezerwacji.");
    } finally {
      setLoading(false);
    }
  };

  const availableHoursForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableHours(selectedDate, parseInt(numberOfHours));
  }, [selectedDate, dbAvailability, existingBookings, numberOfHours]);

  return (
    <section id="booking" className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Zarezerwuj sesję</h2>
            <p className="text-muted-foreground text-lg">Wybierz dogodny termin z naszego grafiku.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-accent/10 rounded-full flex items-center justify-center">
                    <CalendarIcon className="text-gray-accent w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">1. Wybierz termin</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
                  {nextSevenDays.map((date) => {
                    const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    // Sprawdzamy, czy dla danej daty istnieją jakiekolwiek dostępne godziny dla wybranej liczby godzin
                    const hasHours = getAvailableHours(date, parseInt(numberOfHours)).length > 0;
                    
                    return (
                      <button
                        key={date.toString()}
                        type="button"
                        disabled={!hasHours}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedHour(null);
                        }}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                          isSelected 
                            ? "border-gray-accent bg-gray-accent/5 scale-105" 
                            : "border-transparent bg-secondary/30 hover:bg-secondary/50",
                          !hasHours && "opacity-30 cursor-not-allowed grayscale"
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
                      {availableHoursForSelectedDate.length > 0 ? (
                        availableHoursForSelectedDate.map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => setSelectedHour(hour)}
                            className={cn(
                              "py-3 px-2 rounded-xl text-sm font-bold transition-all border-2",
                              selectedHour === hour
                                ? "bg-gray-accent text-primary-foreground border-gray-accent"
                                : "bg-background border-border hover:border-gray-accent/50"
                            )}
                          >
                            {hour}
                          </button>
                        ))
                      ) : (
                        <p className="col-span-full text-center py-12 text-muted-foreground italic">
                          Brak dostępnych godzin w tym dniu dla wybranej liczby godzin.
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

            <div className={cn(
              "transition-all duration-500",
              (!selectedDate || !selectedHour) ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
            )}>
              <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-accent/10 rounded-full flex items-center justify-center">
                    <User className="text-gray-accent w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">2. Twoje dane</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Imię / Pseudonim</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Twoje imię" 
                        className="pl-10 rounded-xl h-12" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="twoj@email.com" 
                        className="pl-10 rounded-xl h-12" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="instagram" 
                        type="text" 
                        placeholder="@twoj_instagram" 
                        className="pl-10 rounded-xl h-12" 
                        value={formData.instagram}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number_of_hours">Ilość godzin</Label>
                    <Select value={numberOfHours} onValueChange={(value) => {
                      setNumberOfHours(value);
                      setSelectedHour(null); // Reset selected hour when number of hours changes
                    }}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Wybierz ilość godzin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 godzina</SelectItem>
                        <SelectItem value="2">2 godziny</SelectItem>
                        <SelectItem value="3">3 godziny</SelectItem>
                        <SelectItem value="4">4 godziny</SelectItem>
                        <SelectItem value="5">5 godzin</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ilość godzin:</span>
                        <span className="font-bold">{numberOfHours}</span>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-2xl text-lg font-bold" 
                      disabled={loading || !selectedDate || !selectedHour}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Clock className="animate-spin w-5 h-5" /> Przetwarzanie...
                        </span>
                      ) : "Potwierdź rezerwację"}
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