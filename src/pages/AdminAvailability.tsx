"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Save, Calendar as CalendarIcon, LogOut, Loader2, ListChecks, ArrowLeft, ArrowRight, User, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '@/components/DatePicker';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

type AvailabilityData = Record<string, Record<string, string>>;

const AdminAvailability = () => {
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; full_name: string, role: string } | null>(null);
  const [admins, setAdmins] = useState<Record<string, string>>({});
  
  const [rangeStart, setRangeStart] = useState<{ day: string; hourIndex: number } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id, full_name, role').eq('id', user.id).single();
        setCurrentAdmin(profile);
      }
    };
    const fetchAllAdmins = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name').in('role', ['admin', 'superadmin']);
      if (data) {
        const adminMap: Record<string, string> = {};
        data.forEach(a => adminMap[a.id] = a.full_name || 'Nieznany');
        setAdmins(adminMap);
      }
    };
    getAdmin();
    fetchAllAdmins();
  }, []);

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

      const formatted: AvailabilityData = {};
      days.forEach(day => formatted[day] = {});
      
      if (data && data.length > 0) {
        const rawData = data[0].availability_data;
        days.forEach(day => {
          if (rawData[day]) formatted[day] = rawData[day];
        });
      }
      setAvailability(formatted);
    } catch (error: any) {
      showError("Błąd pobierania: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHourClick = (day: string, hourIndex: number) => {
    if (!currentAdmin) return;
    const hour = hours[hourIndex];
    const existingAdminId = availability[day]?.[hour];

    if (existingAdminId && existingAdminId !== currentAdmin.id) {
      showError(`Zajęte przez: ${admins[existingAdminId]}`);
      return;
    }

    if (!rangeStart || rangeStart.day !== day) {
      setRangeStart({ day, hourIndex });
      
      setAvailability(prev => {
        const dayData = { ...(prev[day] || {}) };
        if (dayData[hour] === currentAdmin.id) {
          delete dayData[hour];
        } else {
          dayData[hour] = currentAdmin.id;
        }
        return { ...prev, [day]: dayData };
      });
    } else {
      const start = Math.min(rangeStart.hourIndex, hourIndex);
      const end = Math.max(rangeStart.hourIndex, hourIndex);
      
      const hasConflict = hours.slice(start, end + 1).some(h => {
        const id = availability[day]?.[h];
        return id && id !== currentAdmin.id;
      });

      if (hasConflict) {
        showError("Zakres zawiera godziny zajęte przez innego realizatora.");
        setRangeStart(null);
        return;
      }

      setAvailability(prev => {
        const dayData = { ...(prev[day] || {}) };
        for (let i = start; i <= end; i++) {
          dayData[hours[i]] = currentAdmin.id;
        }
        return { ...prev, [day]: dayData };
      });
      
      setRangeStart(null);
      showSuccess("Zaznaczono zakres.");
    }
  };

  const clearDay = (day: string) => {
    setAvailability(prev => {
      const dayData = { ...(prev[day] || {}) };
      Object.keys(dayData).forEach(h => {
        if (dayData[h] === currentAdmin?.id) delete dayData[h];
      });
      return { ...prev, [day]: dayData };
    });
    setRangeStart(null);
  };

  const handleSave = async () => {
    if (!selectedDate) return;
    setSaving(true);
    const weekStartDateFormatted = format(getWeekStartDate(selectedDate), 'yyyy-MM-dd');
    try {
      const { error } = await supabase
        .from('weekly_availability')
        .upsert({ week_start_date: weekStartDateFormatted, availability_data: availability }, { onConflict: 'week_start_date' });
      if (error) throw error;
      showSuccess("Zapisano!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateProfileName = async (newName: string) => {
    if (!currentAdmin) return;
    await supabase.from('profiles').update({ full_name: newName }).eq('id', currentAdmin.id);
    setCurrentAdmin({ ...currentAdmin, full_name: newName });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-gray-accent shrink-0" /> Harmonogram
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <User size={16} className="text-muted-foreground" />
              <Input 
                className="h-8 w-48 text-sm font-bold bg-secondary/30 border-none" 
                value={currentAdmin?.full_name || ''} 
                onChange={(e) => setCurrentAdmin(prev => prev ? {...prev, full_name: e.target.value} : null)}
                onBlur={(e) => updateProfileName(e.target.value)}
                placeholder="Twoje imię"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {currentAdmin?.role === 'superadmin' && (
              <Link to="/admin/users" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full rounded-full px-4 h-11 gap-2 text-sm border-gray-accent text-gray-accent hover:bg-gray-accent/10">
                  <Users size={16} /> Użytkownicy
                </Button>
              </Link>
            )}
            <Link to="/admin/bookings" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full rounded-full px-4 h-11 gap-2 text-sm"><ListChecks size={16} /> Rezerwacje</Button>
            </Link>
            <Button onClick={handleSave} className="w-full sm:w-auto rounded-full px-6 h-11 gap-2 text-sm font-bold" disabled={saving}>
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />} Zapisz
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/20 p-4 rounded-3xl">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(subWeeks(selectedDate!, 1))} className="rounded-full h-10 w-10"><ArrowLeft size={18} /></Button>
            <DatePicker date={selectedDate} setDate={setSelectedDate} className="w-full sm:w-[200px]" />
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(addWeeks(selectedDate!, 1))} className="rounded-full h-10 w-10"><ArrowRight size={18} /></Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            {rangeStart 
              ? `Wybierz godzinę końcową dla dnia: ${rangeStart.day}` 
              : "Kliknij godzinę startową, a potem końcową, aby zaznaczyć zakres."}
          </p>
        </div>

        <div className="bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-secondary/50">
                  {days.map((day) => (
                    <th key={day} className="p-4 text-center border-b border-border">
                      <div className="text-sm font-bold">{day}</div>
                      <div className="flex justify-center mt-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/20 text-destructive" onClick={() => clearDay(day)} title="Wyczyść dzień">
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour, hIndex) => (
                  <tr key={hour}>
                    {days.map(day => {
                      const adminId = availability[day]?.[hour];
                      const isMine = adminId === currentAdmin?.id;
                      const isOthers = adminId && adminId !== currentAdmin?.id;
                      const isRangeStart = rangeStart?.day === day && rangeStart?.hourIndex === hIndex;

                      return (
                        <td key={`${day}-${hour}`} className="p-1 border-b border-border">
                          <button
                            onClick={() => handleHourClick(day, hIndex)}
                            className={cn(
                              "w-full h-10 rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                              isMine ? "bg-gray-accent text-primary-foreground shadow-md" : 
                              isOthers ? "bg-destructive/20 text-destructive cursor-not-allowed" : 
                              "bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
                              isRangeStart && "ring-2 ring-white ring-offset-2 ring-offset-gray-accent"
                            )}
                          >
                            {isOthers ? (admins[adminId] || 'Zajęte') : hour}
                          </button>
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