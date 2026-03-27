"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Save, Calendar as CalendarIcon, LogOut, Loader2, ListChecks, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '@/components/DatePicker';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const AdminAvailability = () => {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectionStart, setSelectionStart] = useState<{ day: string; hour: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const getWeekStartDate = (date: Date) => {
    return startOfWeek(date, { weekStartsOn: 1 });
  };

  const fetchAvailability = async (date: Date) => {
    setLoading(true);
    const weekStartDateFormatted = format(getWeekStartDate(date), 'yyyy-MM-dd');
    try {
      const { data, error } = await supabase
        .from('weekly_availability')
        .select('*')
        .eq('week_start_date', weekStartDateFormatted);
      
      if (error) throw error;

      const formatted: Record<string, string[]> = {};
      days.forEach(day => formatted[day] = []);
      
      if (data && data.length > 0) {
        const weeklyData = data[0].availability_data;
        for (const day of days) {
          if (weeklyData[day]) {
            formatted[day] = weeklyData[day].sort();
          }
        }
      }
      
      setAvailability(formatted);
    } catch (error: any) {
      showError("Błąd pobierania dostępności: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHourClick = useCallback((day: string, hour: string) => {
    setAvailability(prev => {
      const dayHours = prev[day] || [];
      const hourIndex = hours.indexOf(hour);

      if (selectionStart && selectionStart.day === day) {
        const startIndex = hours.indexOf(selectionStart.hour);
        const endIndex = hourIndex;
        const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
        const hoursToToggle = hours.slice(start, end + 1);

        const newDayHours = new Set(dayHours);
        let allSelected = true;
        for (const h of hoursToToggle) {
          if (!newDayHours.has(h)) {
            allSelected = false;
            break;
          }
        }

        if (allSelected) {
          hoursToToggle.forEach(h => newDayHours.delete(h));
        } else {
          hoursToToggle.forEach(h => newDayHours.add(h));
        }

        setSelectionStart(null);
        return { ...prev, [day]: Array.from(newDayHours).sort() };
      } else {
        if (dayHours.includes(hour)) {
          setSelectionStart(null);
          return { ...prev, [day]: dayHours.filter(h => h !== hour).sort() };
        } else {
          setSelectionStart({ day, hour });
          return { ...prev, [day]: [...dayHours, hour].sort() };
        }
      }
    });
  }, [selectionStart]);

  const isHourSelected = useCallback((day: string, hour: string) => {
    return (availability[day] || []).includes(hour);
  }, [availability]);

  const isHourInRange = useCallback((day: string, hour: string) => {
    if (!selectionStart || selectionStart.day !== day) return false;
    const startIndex = hours.indexOf(selectionStart.hour);
    const currentIndex = hours.indexOf(hour);
    if (startIndex === -1 || currentIndex === -1) return false;
    const [start, end] = startIndex < currentIndex ? [startIndex, currentIndex] : [currentIndex, startIndex];
    return currentIndex >= start && currentIndex <= end;
  }, [selectionStart]);

  const handleSave = async () => {
    if (!selectedDate) {
      showError("Wybierz datę, aby zapisać dostępność.");
      return;
    }
    setSaving(true);
    const weekStartDateFormatted = format(getWeekStartDate(selectedDate), 'yyyy-MM-dd');
    try {
      const { error } = await supabase
        .from('weekly_availability')
        .upsert(
          {
            week_start_date: weekStartDateFormatted,
            availability_data: availability
          },
          { onConflict: 'week_start_date' }
        );

      if (error) throw error;
      showSuccess("Harmonogram został zapisany!");
    } catch (error: any) {
      showError("Błąd zapisu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const goToPreviousWeek = () => {
    if (selectedDate) {
      setSelectedDate(subWeeks(selectedDate, 1));
      setSelectionStart(null);
    }
  };

  const goToNextWeek = () => {
    if (selectedDate) {
      setSelectedDate(addWeeks(selectedDate, 1));
      setSelectionStart(null);
    }
  };

  const getWeekRange = (date: Date) => {
    const start = getWeekStartDate(date);
    const end = addDays(start, 6);
    return `${format(start, 'dd.MM', { locale: pl })} - ${format(end, 'dd.MM', { locale: pl })}`;
  };

  const getDayDate = (dayIndex: number) => {
    if (!selectedDate) return '';
    const weekStart = getWeekStartDate(selectedDate);
    const dayDate = addDays(weekStart, dayIndex);
    return format(dayDate, 'dd.MM', { locale: pl });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-accent w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-gray-accent shrink-0" /> Harmonogram
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">Zaznacz godziny dostępności dla wybranego tygodnia.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <Link to="/admin/bookings" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full rounded-full px-4 h-11 gap-2 text-sm">
                <ListChecks size={16} /> Rezerwacje
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="flex-1 sm:flex-none rounded-full px-4 h-11 gap-2 text-sm">
              <LogOut size={16} /> Wyloguj
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto rounded-full px-6 h-11 gap-2 text-sm font-bold" disabled={saving}>
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/20 p-4 rounded-3xl">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="rounded-full h-10 w-10 shrink-0">
              <ArrowLeft size={18} />
            </Button>
            <DatePicker date={selectedDate} setDate={setSelectedDate} className="w-full sm:w-[200px]" />
            <Button variant="outline" size="icon" onClick={goToNextWeek} className="rounded-full h-10 w-10 shrink-0">
              <ArrowRight size={18} />
            </Button>
          </div>
          {selectedDate && (
            <div className="text-center sm:text-right">
              <p className="text-sm font-bold text-gray-accent uppercase tracking-wider">
                Tydzień: {getWeekRange(selectedDate)}
              </p>
            </div>
          )}
        </div>

        <div className="relative bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden">
          <div className="overflow-x-auto pb-4">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-secondary/50">
                  {days.map((day, index) => (
                    <th key={day} className="p-4 text-center border-b border-border font-bold">
                      <div className="text-sm md:text-base">{day}</div>
                      <div className="text-xs font-normal text-muted-foreground">{getDayDate(index)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour} className="hover:bg-secondary/10 transition-colors">
                    {days.map(day => {
                      const isSelected = isHourSelected(day, hour);
                      const inRange = isHourInRange(day, hour);
                      const isStart = selectionStart?.day === day && selectionStart?.hour === hour;

                      return (
                        <td key={`${day}-${hour}`} className="p-1 border-b border-border text-center">
                          <button
                            type="button"
                            onClick={() => handleHourClick(day, hour)}
                            className={cn(
                              "w-full h-10 rounded-lg flex items-center justify-center text-xs md:text-sm font-medium transition-all",
                              isSelected
                                ? "bg-gray-accent text-primary-foreground shadow-md"
                                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
                              inRange && !isSelected && "bg-gray-accent/20 text-gray-accent",
                              isStart && "ring-2 ring-gray-accent ring-offset-2"
                            )}
                          >
                            {hour}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden absolute bottom-2 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground border border-border animate-pulse">
            Przesuń w bok →
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAvailability;