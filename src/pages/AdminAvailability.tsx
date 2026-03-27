"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Save, Calendar as CalendarIcon, LogOut, Loader2, ListChecks, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '@/components/DatePicker';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

// Nowa struktura danych: Day -> Hour -> AdminID
type AvailabilityData = Record<string, Record<string, string>>;

const AdminAvailability = () => {
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; full_name: string } | null>(null);
  const [admins, setAdmins] = useState<Record<string, string>>({}); // ID -> Name
  const navigate = useNavigate();

  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id, full_name').eq('id', user.id).single();
        setCurrentAdmin(profile);
      }
    };
    const fetchAllAdmins = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'admin');
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
        // Konwersja ze starego formatu (tablica) na nowy (obiekt) jeśli potrzeba
        days.forEach(day => {
          if (Array.isArray(rawData[day])) {
            // Stary format - przypisujemy do pierwszego admina (migracja w locie)
            rawData[day].forEach((h: string) => {
              formatted[day][h] = currentAdmin?.id || '';
            });
          } else if (rawData[day]) {
            formatted[day] = rawData[day];
          }
        });
      }
      
      setAvailability(formatted);
    } catch (error: any) {
      showError("Błąd pobierania dostępności: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHourClick = (day: string, hour: string) => {
    if (!currentAdmin) return;

    setAvailability(prev => {
      const dayData = { ...(prev[day] || {}) };
      const existingAdminId = dayData[hour];

      if (existingAdminId && existingAdminId !== currentAdmin.id) {
        showError(`Ten termin jest już zajęty przez: ${admins[existingAdminId] || 'innego realizatora'}`);
        return prev;
      }

      if (existingAdminId === currentAdmin.id) {
        delete dayData[hour];
      } else {
        dayData[hour] = currentAdmin.id;
      }

      return { ...prev, [day]: dayData };
    });
  };

  const handleSave = async () => {
    if (!selectedDate) return;
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

  const updateProfileName = async (newName: string) => {
    if (!currentAdmin) return;
    const { error } = await supabase.from('profiles').update({ full_name: newName }).eq('id', currentAdmin.id);
    if (!error) {
      setCurrentAdmin({ ...currentAdmin, full_name: newName });
      showSuccess("Imię zaktualizowane!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-gray-accent shrink-0" /> Harmonogram Realizatorów
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <User size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">Zalogowany jako: </span>
              <Input 
                className="h-8 w-48 text-sm font-bold bg-secondary/30 border-none" 
                value={currentAdmin?.full_name || ''} 
                onChange={(e) => setCurrentAdmin(prev => prev ? {...prev, full_name: e.target.value} : null)}
                onBlur={(e) => updateProfileName(e.target.value)}
                placeholder="Twoje imię i nazwisko"
              />
            </div>
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
              Zapisz zmiany
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/20 p-4 rounded-3xl">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(subWeeks(selectedDate!, 1))} className="rounded-full h-10 w-10">
              <ArrowLeft size={18} />
            </Button>
            <DatePicker date={selectedDate} setDate={setSelectedDate} className="w-full sm:w-[200px]" />
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(addWeeks(selectedDate!, 1))} className="rounded-full h-10 w-10">
              <ArrowRight size={18} />
            </Button>
          </div>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-accent rounded-full"></div> Twoje
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive/50 rounded-full"></div> Inny realizator
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-secondary/50">
                  {days.map((day, index) => (
                    <th key={day} className="p-4 text-center border-b border-border font-bold">
                      <div className="text-sm">{day}</div>
                      <div className="text-xs font-normal text-muted-foreground">{format(addDays(getWeekStartDate(selectedDate!), index), 'dd.MM')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour}>
                    {days.map(day => {
                      const adminId = availability[day]?.[hour];
                      const isMine = adminId === currentAdmin?.id;
                      const isOthers = adminId && adminId !== currentAdmin?.id;

                      return (
                        <td key={`${day}-${hour}`} className="p-1 border-b border-border">
                          <button
                            type="button"
                            onClick={() => handleHourClick(day, hour)}
                            className={cn(
                              "w-full h-10 rounded-lg text-xs font-medium transition-all",
                              isMine ? "bg-gray-accent text-primary-foreground shadow-md" : 
                              isOthers ? "bg-destructive/20 text-destructive cursor-not-allowed" : 
                              "bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
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