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

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

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
    instagram: '',
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
    console.log("[BookingForm] Fetching availability...");
    const { data, error } = await supabase.from('availability').select('*');
    if (error) {
      console.error("[BookingForm] Błąd pobierania dostępności:", error);
    } else {
      const formatted: Record<string, string[]> = {};
      days.forEach(day => {
        formatted[day] = [];
      });
      
      if (data) {
        data.forEach((curr: any) => {
          formatted[curr.day_name] = curr.hours;
        });
      }
      setDbAvailability(formatted);
      console.log("[BookingForm] Fetched availability:", formatted);
    }
  };

  const fetchExistingBookings = async () => {
    console.log("[BookingForm] Fetching existing bookings...");
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) {
      console.error("[BookingForm] Błąd pobierania istniejących rezerwacji:", error);
    } else if (data) {
      setExistingBookings(data);
      console.log("[BookingForm] Fetched existing bookings:", data);
    }
  };

  const isHourAvailableInAdminSchedule = (checkDate: Date, checkHour: string) => {
    const checkDayName = dayMap[getDay(checkDate)];
    const dayAvailability = dbAvailability[checkDayName];
    return dayAvailability && dayAvailability.includes(checkHour);
  };

  const hasBookingCollision = (potentialBookingStart: Date, potentialBookingEnd: Date) => {
    return existingBookings.some(existingBooking => {
      const existingBookingDate = parseISO(existingBooking.booking_date);
      const existingBookingStart = setMilliseconds(setSeconds(setMinutes(setHours(existingBookingDate, parseInt(existingBooking.booking_hour.split(':')[0])), 0), 0), 0);
      const existingBookingEnd = addHours(existingBookingStart, existingBooking.number_of_hours);

      // Sprawdzenie, czy zakresy czasowe się nakładają
      return (
        (isBefore(potentialBookingStart, existingBookingEnd) && isAfter(potentialBookingEnd, existingBookingStart)) ||
        (potentialBookingStart.getTime() === existingBookingStart.getTime() && potentialBookingEnd.getTime() === existingBookingEnd.getTime()) ||
        (isBefore(existingBookingStart, potentialBookingEnd) && isAfter(existingBookingEnd, potentialBookingStart))
      );
    });
  };

  const isHourTrulyAvailable = (date: Date, startHour: string) => {
    const bookingStart = setMilliseconds(setSeconds(setMinutes(setHours(date, parseInt(startHour.split(':')[0])), 0), 0), 0);
    const bookingEnd = addHours(bookingStart, 1); // Sprawdzamy dostępność dla pojedynczej godziny

    // 1. Sprawdź dostępność w grafiku administratora dla tej godziny
    if (!isHourAvailableInAdminSchedule(bookingStart, startHour)) {
      return false;
    }

    // 2. Sprawdź kolizje z istniejącymi rezerwacjami dla tej pojedynczej godziny
    if (hasBookingCollision(bookingStart, bookingEnd)) {
      return false;
    }
    
    return true;
  };

  const getMaxBookableHours = (date: Date, startHour: string) => {
    if (!date || !startHour) return 0;

    let maxHours = 0;
    for (let i = 1; i <= 12; i++) { 
      const potentialBookingStartSegment = setMilliseconds(setSeconds(setMinutes(setHours(date, parseInt(startHour.split(':')[0])), 0), 0), 0);
      const potentialBookingEndSegment = addHours(potentialBookingStartSegment, i);

      let possible = true;
      for (let j = 0; j < i; j++) {
        const currentCheckTime = addHours(potentialBookingStartSegment, j);
        const currentCheckHourFormatted = format(currentCheckTime, 'HH:00');
        const currentSegmentEnd = addHours(currentCheckTime, 1);

        // Sprawdź dostępność w grafiku administratora dla każdej godziny w zakresie
        if (!isHourAvailableInAdminSchedule(currentCheckTime, currentCheckHourFormatted)) {
          possible = false;
          break;
        }
        // Sprawdź kolizje z istniejącymi rezerwacjami dla każdej godziny w zakresie
        if (hasBookingCollision(currentCheckTime, currentSegmentEnd)) {
          possible = false;
          break;
        }
      }

      if (possible) {
        maxHours = i;
      } else {
        break; 
      }
    }
    console.log(`[BookingForm] Max bookable hours for ${format(date, 'yyyy-MM-dd')} at ${startHour}: ${maxHours}`);
    return maxHours;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedHour(null); 
    setNumberOfHours('1'); 
  };

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    setNumberOfHours('1'); 
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

      showSuccess(`Zarezerwowano termin: ${format(selectedDate, "dd.MM")} o godzinie ${selectedHour} na ${numberOfHours} ${formatHoursPlural(parseInt(numberOfHours))}.`);
      
      setSelectedDate(null);
      setSelectedHour(null);
      setNumberOfHours('1');
      setFormData({ service: 'recording', name: '', email: '', instagram: '' });
      fetchExistingBookings(); 
      
    } catch (error: any) {
      showError(error.message || "Wystąpił błąd podczas rezerwacji.");
    } finally {
      setLoading(false);
    }
  };

  const allPossibleHoursForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const allHours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    return allHours.map(hour => ({
      hour,
      isAvailable: isHourTrulyAvailable(selectedDate, hour)
    }));
  }, [selectedDate, dbAvailability, existingBookings]);

  const maxBookableHours = useMemo(() => {
    if (!selectedDate || !selectedHour) return 0;
    return getMaxBookableHours(selectedDate, selectedHour);
  }, [selectedDate, selectedHour, dbAvailability, existingBookings]);

  const formatHoursPlural = (count: number) => {
    if (count === 1) {
      return "godzina";
    }
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
      return "godziny";
    }
    return "godzin";
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
                    // Sprawdzamy, czy dla danego dnia są jakiekolwiek godziny, które są truly available
                    const hasAnyTrulyAvailableHours = allPossibleHoursForSelectedDate.filter(item => 
                      format(selectedDate || new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? item.isAvailable : isHourTrulyAvailable(date, item.hour)
                    ).length > 0;
                    
                    return (
                      <button
                        key={date.toString()}
                        type="button"
                        disabled={!hasAnyTrulyAvailableHours} // Wyłączamy przycisk dnia, jeśli nie ma żadnych dostępnych godzin
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                          isSelected 
                            ? "border-gray-accent bg-gray-accent/5 scale-105" 
                            : "border-transparent bg-secondary/30 hover:bg-secondary/50",
                          !hasAnyTrulyAvailableHours && "opacity-30 cursor-not-allowed grayscale"
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
                      {allPossibleHoursForSelectedDate.length > 0 ? (
                        allPossibleHoursForSelectedDate.map(({ hour, isAvailable }) => (
                          <button
                            key={hour}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleHourSelect(hour)}
                            className={cn(
                              "py-3 px-2 rounded-xl text-sm font-bold transition-all border-2",
                              selectedHour === hour
                                ? "bg-gray-accent text-primary-foreground border-gray-accent"
                                : "bg-background border-border hover:border-gray-accent/50",
                              !isAvailable && "opacity-30 cursor-not-allowed bg-secondary/30 border-border"
                            )}
                          >
                            {hour}
                          </button>
                        ))
                      ) : (
                        <p className="col-span-full text-center py-12 text-muted-foreground italic">
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
                    <Select value={numberOfHours} onValueChange={(value) => setNumberOfHours(value)} disabled={!selectedDate || !selectedHour}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Wybierz ilość godzin" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: maxBookableHours }, (_, i) => i + 1).map(hourNum => (
                          <SelectItem key={hourNum} value={String(hourNum)}>
                            {hourNum} {formatHoursPlural(hourNum)}
                          </SelectItem>
                        ))}
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
                        <span className="font-bold">{numberOfHours} {formatHoursPlural(parseInt(numberOfHours))}</span>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-2xl text-lg font-bold" 
                      disabled={loading || !selectedDate || !selectedHour || parseInt(numberOfHours) === 0}
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