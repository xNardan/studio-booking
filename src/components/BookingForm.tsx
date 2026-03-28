"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, ArrowLeft, ArrowRight, CalendarOff } from 'lucide-react';
import { format, addDays, startOfToday, getDay, parseISO, addHours, isBefore, isAfter, setHours, setMinutes, setSeconds, setMilliseconds, isToday, startOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';

const dayMap: Record<number, string> = {
  0: "Niedziela", 1: "Poniedziałek", 2: "Wtorek", 3: "Środa", 4: "Czwartek", 5: "Piątek", 6: "Sobota"
};

const BookingForm = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [numberOfHours, setNumberOfHours] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [dbAvailability, setDbAvailability] = useState<Record<string, Record<string, string>>>({});
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [admins, setAdmins] = useState<Record<string, string>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfToday());
  
  const [formData, setFormData] = useState({ name: '', email: '', instagram: '' });

  useEffect(() => {
    const fetchData = async () => {
      await fetchAvailability();
      await fetchExistingBookings();
      await fetchAdmins();
    };
    fetchData();
  }, [currentWeekStart]);

  useEffect(() => {
    setNumberOfHours('1');
  }, [selectedHour, selectedDate]);

  const fetchAdmins = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name').in('role', ['admin', 'superadmin']);
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(a => map[a.id] = a.full_name || 'Realizator');
      setAdmins(map);
    }
  };

  const fetchAvailability = async () => {
    const weekStart = format(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const { data } = await supabase.from('weekly_availability').select('availability_data').eq('week_start_date', weekStart).single();
    if (data) {
      setDbAvailability(data.availability_data);
    } else {
      setDbAvailability({});
    }
  };

  const fetchExistingBookings = async () => {
    const { data } = await supabase.from('bookings').select('*');
    if (data) setExistingBookings(data);
  };

  const getEngineerForSlot = (date: Date, hour: string) => {
    const dayName = dayMap[getDay(date)];
    return dbAvailability[dayName]?.[hour];
  };

  const isHourTrulyAvailable = (date: Date, hour: string) => {
    const bookingStart = setMilliseconds(setSeconds(setMinutes(setHours(date, parseInt(hour.split(':')[0])), 0), 0), 0);
    if (isBefore(bookingStart, new Date())) return false;

    const adminId = getEngineerForSlot(date, hour);
    if (!adminId) return false;

    const collision = existingBookings.some(b => {
      const bDate = parseISO(b.booking_date);
      if (format(bDate, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')) return false;
      const bStart = setHours(bDate, parseInt(b.booking_hour.split(':')[0]));
      const bEnd = addHours(bStart, b.number_of_hours);
      return (isBefore(bookingStart, bEnd) && isAfter(addHours(bookingStart, 1), bStart));
    });

    return !collision;
  };

  const isHourVisible = (date: Date, hour: string) => {
    const hasAdmin = !!getEngineerForSlot(date, hour);
    const isBooked = existingBookings.some(b => {
      const bDate = parseISO(b.booking_date);
      if (format(bDate, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')) return false;
      const bStart = setHours(bDate, parseInt(b.booking_hour.split(':')[0]));
      const bEnd = addHours(bStart, b.number_of_hours);
      const slotStart = setHours(date, parseInt(hour.split(':')[0]));
      return (isBefore(slotStart, bEnd) && isAfter(addHours(slotStart, 1), bStart));
    });
    return hasAdmin || isBooked;
  };

  const visibleDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)).filter(date => {
      const dayName = dayMap[getDay(date)];
      const hasAnyAdmin = dbAvailability[dayName] && Object.values(dbAvailability[dayName]).some(val => !!val);
      const hasAnyBooking = existingBookings.some(b => b.booking_date === format(date, 'yyyy-MM-dd'));
      return hasAnyAdmin || hasAnyBooking;
    });
  }, [currentWeekStart, dbAvailability, existingBookings]);

  const maxAvailableHours = useMemo(() => {
    if (!selectedDate || !selectedHour) return 0;
    const startH = parseInt(selectedHour.split(':')[0]);
    const adminId = getEngineerForSlot(selectedDate, selectedHour);
    if (!adminId) return 0;

    let count = 0;
    for (let i = 0; i < 8; i++) {
      const currentH = startH + i;
      if (currentH >= 24) break;
      const currentHourStr = `${String(currentH).padStart(2, '0')}:00`;
      if (getEngineerForSlot(selectedDate, currentHourStr) !== adminId) break;
      const slotStart = setHours(new Date(selectedDate), currentH);
      const isBooked = existingBookings.some(b => {
        const bDate = parseISO(b.booking_date);
        if (format(bDate, 'yyyy-MM-dd') !== format(selectedDate, 'yyyy-MM-dd')) return false;
        const bStart = setHours(bDate, parseInt(b.booking_hour.split(':')[0]));
        const bEnd = addHours(bStart, b.number_of_hours);
        return (isBefore(slotStart, bEnd) && isAfter(addHours(slotStart, 1), bStart));
      });
      if (isBooked) break;
      count++;
    }
    return count;
  }, [selectedDate, selectedHour, dbAvailability, existingBookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = selectedDate && selectedHour ? getEngineerForSlot(selectedDate, selectedHour) : null;
    const engineerName = adminId ? admins[adminId] : 'Realizator';
    
    if (!selectedDate || !selectedHour || !adminId || !formData.name || !formData.email) {
      showError("Wypełnij wszystkie pola.");
      return;
    }

    setLoading(true);
    try {
      const { error: dbError } = await supabase.from('bookings').insert({
        service: 'recording',
        customer_name: formData.name,
        customer_email: formData.email,
        customer_instagram: formData.instagram,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_hour: selectedHour,
        number_of_hours: parseInt(numberOfHours),
        admin_id: adminId
      });

      if (dbError) throw dbError;

      // Wywołanie funkcji z pełnym adresem URL
      await fetch('https://lusuraonlijbjnvxihzt.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          instagram: formData.instagram,
          bookingDate: format(selectedDate, 'dd.MM.yyyy'),
          bookingHour: selectedHour,
          duration: numberOfHours,
          engineerName: engineerName
        })
      });

      showSuccess("Zarezerwowano pomyślnie!");
      setSelectedDate(null);
      setSelectedHour(null);
      setNumberOfHours('1');
      setFormData({ name: '', email: '', instagram: '' });
      fetchExistingBookings();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedEngineerName = selectedDate && selectedHour ? admins[getEngineerForSlot(selectedDate, selectedHour) || ''] : null;

  return (
    <section id="booking" className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <Button variant="outline" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} disabled={isToday(currentWeekStart)} className="rounded-full"><ArrowLeft /></Button>
              <span className="font-bold text-gray-accent">{format(currentWeekStart, 'dd.MM')} - {format(addDays(currentWeekStart, 6), 'dd.MM')}</span>
              <Button variant="outline" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="rounded-full"><ArrowRight /></Button>
            </div>

            {visibleDays.length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-8">
                {visibleDays.map(date => (
                  <button
                    key={date.toString()}
                    onClick={() => { setSelectedDate(date); setSelectedHour(null); }}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center",
                      selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? "border-gray-accent bg-gray-accent/5" : "border-transparent bg-secondary/30",
                      isBefore(date, startOfToday()) && "opacity-20 grayscale cursor-not-allowed"
                    )}
                    disabled={isBefore(date, startOfToday())}
                  >
                    <span className="text-[10px] font-bold uppercase opacity-50">{format(date, "EEE", { locale: pl })}</span>
                    <span className="text-lg font-black">{format(date, "d")}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarOff size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Brak dostępnych terminów w tym tygodniu.</p>
              </div>
            )}

            {selectedDate && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
                  .filter(hour => isHourVisible(selectedDate, hour))
                  .map(hour => {
                    const available = isHourTrulyAvailable(selectedDate, hour);
                    return (
                      <button
                        key={hour}
                        disabled={!available}
                        onClick={() => setSelectedHour(hour)}
                        className={cn(
                          "py-3 rounded-xl text-xs font-bold border-2 transition-all",
                          selectedHour === hour ? "bg-gray-accent text-primary-foreground border-gray-accent" : "bg-background border-border",
                          !available && "opacity-20 cursor-not-allowed bg-secondary/10"
                        )}
                      >
                        {hour}
                        {!available && <span className="block text-[8px] opacity-50">ZAJĘTE</span>}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className={cn("transition-all", !selectedHour && "opacity-50 pointer-events-none")}>
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl sticky top-24">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <User className="text-muted-foreground" size={24} /> 2. Twoje dane
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Imię / Pseudonim *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    className="rounded-2xl h-14 bg-secondary/20 border-none focus-visible:ring-gray-accent" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Email *</Label>
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                    className="rounded-2xl h-14 bg-secondary/20 border-none focus-visible:ring-gray-accent" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Instagram</Label>
                  <Input 
                    placeholder="@nick" 
                    value={formData.instagram} 
                    onChange={e => setFormData({...formData, instagram: e.target.value})} 
                    className="rounded-2xl h-14 bg-secondary/20 border-none focus-visible:ring-gray-accent" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Ilość godzin</Label>
                  <Select value={numberOfHours} onValueChange={setNumberOfHours}>
                    <SelectTrigger className="rounded-2xl h-14 bg-secondary/20 border-none focus:ring-gray-accent">
                      <SelectValue placeholder="Wybierz ilość godzin" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border bg-card">
                      {Array.from({ length: maxAvailableHours }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()} className="rounded-xl">
                          {num} h
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  {selectedEngineerName && (
                    <p className="text-[10px] text-muted-foreground text-center mb-4 italic">
                      * Sesja zostanie poprowadzona przez realizatora: <span className="font-bold text-foreground">{selectedEngineerName}</span>
                    </p>
                  )}
                  <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-bold text-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all" disabled={loading}>
                    {loading ? "Przetwarzanie..." : "Potwierdź rezerwację"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;