"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess, showError } from '@/utils/toast';
import { Save, Calendar as CalendarIcon, LogOut, Loader2, ListChecks } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '@/components/DatePicker'; // Import DatePicker
import { format, startOfWeek, addWeeks, subWeeks, getDay } from 'date-fns';
import { pl } from 'date-fns/locale'; // Importuj polską lokalizację

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`); // 00:00 - 23:00

const AdminAvailability = () => {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Domyślnie dzisiejsza data
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const getWeekStartDate = (date: Date) => {
    // startOfWeek w date-fns domyślnie zaczyna od niedzieli.
    // Aby zacząć od poniedziałku, używamy { weekStartsOn: 1 }.
    return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  };

  const fetchAvailability = async (date: Date) => {
    setLoading(true);
    const weekStartDate = getWeekStartDate(date);
    try {
      const { data, error } = await supabase
        .from('weekly_availability') // Nowa tabela do przechowywania tygodniowej dostępności
        .select('*')
        .eq('week_start_date', weekStartDate);
      
      if (error) throw error;

      const formatted: Record<string, string[]> = {};
      days.forEach(day => formatted[day] = []);
      
      if (data && data.length > 0) {
        const weeklyData = data[0].availability_data; // Zakładamy, że availability_data to JSONB
        for (const day of days) {
          if (weeklyData[day]) {
            formatted[day] = weeklyData[day];
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

  const toggleHour = (day: string, hour: string) => {
    setAvailability(prev => {
      const dayHours = prev[day] || [];
      if (dayHours.includes(hour)) {
        return { ...prev, [day]: dayHours.filter(h => h !== hour) };
      } else {
        return { ...prev, [day]: [...dayHours, hour] };
      }
    });
  };

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
            availability_data: availability // Zapisujemy cały obiekt jako JSONB
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
    }
  };

  const goToNextWeek = () => {
    if (selectedDate) {
      setSelectedDate(addWeeks(selectedDate, 1));
    }
  };

  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = addWeeks(start, 1); // Koniec tygodnia to początek następnego
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
                    {days.map(day => (
                      <td key={`${day}-${hour}`} className="p-4 border-b border-border text-center">
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={(availability[day] || []).includes(hour)}
                            onCheckedChange={() => toggleHour(day, hour)}
                            className="w-6 h-6 rounded-md"
                          />
                        </div>
                      </td>
                    ))}
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