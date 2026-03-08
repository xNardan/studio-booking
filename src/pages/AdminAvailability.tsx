"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess, showError } from '@/utils/toast';
import { Save, Calendar as CalendarIcon, LogOut, Loader2, ListChecks, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '@/components/DatePicker';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { pl } from 'date-fns/locale';

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
    return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  };

  const fetchAvailability = async (date: Date) => {
    setLoading(true);
    const weekStartDate = getWeekStartDate(date);
    try {
      const { data, error } = await supabase
        .from('weekly_availability')
        .select('*')
        .eq('week_start_date', weekStartDate);
      
      if (error) throw error;

      const formatted: Record<string, string[]> = {};
      days.forEach(day => formatted[day] = []);
      
      if (data && data.length > 0) {
        const weeklyData = data[0].availability_data;
        for (const day of days) {
          if (weeklyData[day]) {
            formatted[day] = weeklyData[day].sort(); // Sort hours for consistent range selection
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
        // Complete a range selection
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
          // If all hours in the range are already selected, deselect them
          hoursToToggle.forEach(h => newDayHours.delete(h));
        } else {
          // Otherwise, select all hours in the range
          hoursToToggle.forEach(h => newDayHours.add(h));
        }

        setSelectionStart(null);
        return { ...prev, [day]: Array.from(newDayHours).sort() };
      } else {
        // Start a new range selection or toggle a single hour
        setSelectionStart({ day, hour });
        if (dayHours.includes(hour) && !selectionStart) {
          // If clicking an already selected hour without an active selection, deselect it
          return { ...prev, [day]: dayHours.filter(h => h !== hour).sort() };
        } else if (!dayHours.includes(hour) && !selectionStart) {
          // If clicking an unselected hour without an active selection, select it
          return { ...prev, [day]: [...dayHours, hour].sort() };
        }
        return prev; // If selectionStart is active but on a different day, do nothing yet
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
    const weekStartDate = getWeekStartDate(selectedDate);
    try {
      const { error } = await supabase
        .from('weekly_availability')
        .upsert(
          {
            week_start_date: weekStartDate,
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
      setSelectionStart(null); // Clear selection on week change
    }
  };

  const goToNextWeek = () => {
    if (selectedDate) {
      setSelectedDate(addWeeks(selectedDate, 1));
      setSelectionStart(null); // Clear selection on week change
    }
  };

  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = addWeeks(start, 1);
    return `${format(start, 'dd.MM.yyyy', { locale: pl })} - ${format(subWeeks(end, 0), 'dd.MM.yyyy', { locale: pl })}`;
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
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-gray-accent" /> Panel Realizatora
            </h1>
            <p className="text-muted-foreground">Zaznacz godziny, w których jesteś dostępny dla wybranego tygodnia.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/bookings">
              <Button variant="outline" className="rounded-full px-6 h-12 gap-2">
                <ListChecks size={18} /> Rezerwacje
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="rounded-full px-6 h-12 gap-2">
              <LogOut size={18} /> Wyloguj
            </Button>
            <Button onClick={handleSave} className="rounded-full px-8 h-12 gap-2" disabled={saving}>
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={18} />}
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={goToPreviousWeek} className="rounded-full h-12 px-4">
              <ArrowLeft /> Poprzedni tydzień
            </Button>
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
            <Button variant="outline" onClick={goToNextWeek} className="rounded-full h-12 px-4">
              Następny tydzień <ArrowRight />
            </Button>
          </div>
          {selectedDate && (
            <p className="text-lg font-semibold text-gray-accent">
              Tydzień: {getWeekRange(selectedDate)}
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="p-4 text-left border-b border-border font-bold">Godzina</th>
                  {days.map(day => (
                    <th key={day} className="p-4 text-center border-b border-border font-bold min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 border-b border-border font-medium text-sm">{hour}</td>
                    {days.map(day => {
                      const isSelected = isHourSelected(day, hour);
                      const inRange = isHourInRange(day, hour);
                      const isStart = selectionStart?.day === day && selectionStart?.hour === hour;

                      return (
                        <td key={`${day}-${hour}`} className="p-4 border-b border-border text-center">
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => handleHourClick(day, hour)}
                              className={`w-6 h-6 rounded-md ${inRange ? 'bg-blue-200 border-blue-500' : ''} ${isStart ? 'border-2 border-blue-700' : ''}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAvailability;