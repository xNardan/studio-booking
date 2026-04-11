"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { User, ArrowLeft, ArrowRight, CalendarOff, Loader2, Headphones } from 'lucide-react';
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
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dbAvailability, setDbAvailability] = useState<Record<string, Record<string, string>>>({});
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [admins, setAdmins] = useState<Record<string, string>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(startOfToday(), { weekStartsOn: 1 }));
  
  const [formData, setFormData] = useState({ name: '', email: '', instagram: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        await Promise.all([
          fetchAvailability(),
          fetchExistingBookings(),
          fetchAdmins()
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [currentWeekStart]);

  useEffect(() => {
    setNumberOfHours('1');
  }, [selectedHour, selectedDate]);

  const fetchAdmins = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name');
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(a => map[a.id] = a.full_name || 'Realizator');
      setAdmins(map);
    }
  };

  const fetchAvailability = async () => {
    const weekStart = format(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    // currentWeekStart zawsze zaczyna się od poniedziałku w tym komponencie,
    // więc pobieramy dokładnie ten tydzień pozwalając wyświetlać 30/31/1/2/3 w właściwej kolejności.
    const { data, error } = await supabase
      .from('weekly_availability')
      .select('availability_data')
      .eq('week_start_date', weekStart)
      .maybeSingle();
    
    if (error) {
      console.error("Availability fetch error:", error);
      setDbAvailability({});
      return;
    }
    setDbAvailability(data?.availability_data || {});
  };

  const fetchExistingBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('booking_date, booking_hour, number_of_hours');
    
    if (error) {
      console.error("Bookings fetch error:", error);
      setExistingBookings([]);
      return;
    }
    setExistingBookings(data || []);
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
      if (b.booking_date !== format(date, 'yyyy-MM-dd')) return false;
      const bStartH = parseInt(b.booking_hour.split(':')[0]);
      const bEndH = bStartH + b.number_of_hours;
      const currentH = parseInt(hour.split(':')[0]);
      return currentH >= bStartH && currentH < bEndH;
    });

    return !collision;
  };

  const isHourVisible = (date: Date, hour: string) => {
    const hasAdmin = !!getEngineerForSlot(date, hour);
    const isBooked = existingBookings.some(b => {
      if (b.booking_date !== format(date, 'yyyy-MM-dd')) return false;
      const bStartH = parseInt(b.booking_hour.split(':')[0]);
      const bEndH = bStartH + b.number_of_hours;
      const currentH = parseInt(hour.split(':')[0]);
      return currentH >= bStartH && currentH < bEndH;
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
      
      const isBooked = existingBookings.some(b => {
        if (b.booking_date !== format(selectedDate, 'yyyy-MM-dd')) return false;
        const bStartH = parseInt(b.booking_hour.split(':')[0]);
        const bEndH = bStartH + b.number_of_hours;
        return currentH >= bStartH && currentH < bEndH;
      });
      
      if (isBooked) break;
      count++;
    }
    return count;
  }, [selectedDate, selectedHour, dbAvailability, existingBookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = selectedDate && selectedHour ? getEngineerForSlot(selectedDate, selectedHour) : null;
    const engineerName = adminId ? (admins[adminId] ?? 'Realizator') : 'Realizator';

    if (!selectedDate || !selectedHour || !adminId || !formData.name || !formData.email) {
      showError("Wypełnij wszystkie pola.");
      return;
    }

    setSubmitting(true);
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

      const bookingDetails = `${format(selectedDate, 'dd.MM.yyyy')} o godzinie ${selectedHour} (${numberOfHours}h) | Realizator: ${engineerName}`;
      const fullMessage = `
        Data: ${format(selectedDate, 'dd.MM.yyyy')}
        Godzina: ${selectedHour}
        Czas: ${numberOfHours}h
        Realizator: ${engineerName}
        Instagram: ${formData.instagram || 'Brak'}
      `;

      await supabase.functions.invoke('send-email', {
        body: {
          name: formData.name,
          email: formData.email,
          message: fullMessage,
          bookingDetails: bookingDetails,
          engineerName: engineerName
        }
      });

      showSuccess("Zarezerwowano pomyślnie!");
      setSelectedDate(null);
      setSelectedHour(null);
      setFormData({ name: '', email: '', instagram: '' });
      await fetchExistingBookings();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEngineerName = selectedDate && selectedHour ? (admins[getEngineerForSlot(selectedDate, selectedHour) || ''] ?? 'Realizator') : null;

  return (
    <section id="booking" className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4 max-w-6xl">
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-accent mb-4" size={48} />
            <p className="text-muted-foreground animate-pulse">Pobieranie dostępnych terminów...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentWeekStart(addDays(currentWeekStart, -7));
                    setSelectedDate(null);
                    setSelectedHour(null);
                  }}
                  disabled={isToday(currentWeekStart)}
                  className="rounded-full"
                ><ArrowLeft /></Button>
                <span className="font-bold text-gray-accent">{format(currentWeekStart, 'dd.MM')} - {format(addDays(currentWeekStart, 6), 'dd.MM')}</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentWeekStart(addDays(currentWeekStart, 7));
                    setSelectedDate(null);
                    setSelectedHour(null);
                  }}
                  className="rounded-full"
                ><ArrowRight /></Button>
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
                <div className="space-y-6">
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
                  
                  {selectedHour && selectedEngineerName && (
                    <div className="flex items-center gap-3 p-4 bg-gray-accent/10 rounded-2xl border border-gray-accent/20 animate-in fade-in slide-in-from-top-2">
                      <div className="w-10 h-10 bg-gray-accent rounded-full flex items-center justify-center text-primary-foreground">
                        <Headphones size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-accent uppercase tracking-wider">Wybrany realizator</p>
                        <p className="text-lg font-black">{selectedEngineerName}</p>
                      </div>
                    </div>
                  )}
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
                    <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-bold text-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all" disabled={submitting}>
                      {submitting ? "Przetwarzanie..." : "Potwierdź rezerwację"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingForm;